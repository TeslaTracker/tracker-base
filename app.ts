import config from './config';
import { rm, readdir, pathExists, readFile, writeFile, ensureFile, appendFile, ensureDir } from 'fs-extra';
import colors from 'colors';
import { exec } from 'child_process';
import simpleGit from 'simple-git';
import { ISource } from './interfaces/config.interface';
import moment from 'moment';
import { cleanupFile, generateUrlsList } from './utils';
import recursive from 'recursive-readdir';
import path from 'path';
import { Cluster } from 'puppeteer-cluster';

const isDev = process.env.DEV;
const dummyDomain = 'https://cyriaque.net';
console.log('Starting scrap process...');
const git = simpleGit();

if (!process.env.GH_TOKEN) {
  throw new Error(colors.red('MISSING GH_TOKEN env var'));
}

if (isDev) {
  console.log(colors.yellow(`-- Dev mode enabled --`));
  console.log(`${colors.cyan(`🛈 ${colors.white(dummyDomain)} will be scrapped instead and changes won't be pushed`)}`);
}

config.sources.forEach(async (source) => {
  await cleanupTrackingFolder('temp/' + source.folderName);

  const urlsList = generateUrlsList(source, config);

  const availablePages: string[] = [];

  // Create a cluster with 2 workers
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 5,
    puppeteerOptions: {},
  });

  // Define a task (in this case: screenshot of page)
  await cluster.task(async ({ page, data: url }) => {
    console.log(colors.cyan(`Processing ${colors.white(url)}...`));
    const response = await page.goto(url);

    if (response.status() !== 200) {
      console.log(colors.yellow(`Not available (${response.status()}) ${colors.white(url)}`));
      return;
    }

    await page.waitForSelector('body');
    let bodyHTML = await page.evaluate(() => document.body.innerHTML);
    // temp/name/fr_FR/about.html
    const parsedUrl = new URL(url);
    const fileName = parsedUrl.pathname;
    const filePath = `temp/${config.sources[0].folderName}${fileName}.html`;

    // ensure the folder hierarchy
    await ensureFile(filePath);

    // write the body content in a file
    await writeFile(filePath, bodyHTML);
    await page.close();
    availablePages.push(filePath);
    return;
  });

  urlsList.forEach(async (url) => {
    cluster.queue(url);
  });

  await cluster.idle();
  await cluster.close();

  console.log(colors.cyan(`Browsing complete - generating manifest file...`));

  const manifestFile = `temp/${source.folderName}/manifest.txt`;
  await ensureFile(manifestFile);
  //sort the result array for consistency
  availablePages.sort();

  // log the results into a file
  availablePages.forEach(async (page) => {
    // only add the page to the manifest if it was available
    await appendFile(manifestFile, `${page}\n`);
  });
  await prettyCode(source);
  await cleanupFiles(source);
});

/**
 * Try to detect rng and duplicated values and clean them
 */
async function cleanupFiles(source: ISource) {
  console.log(colors.cyan(`Cleaning up files...`));
  const dir = `temp/${source.folderName}`;
  const files = await recursive(dir, config.protectedFiles);

  files.forEach(async (file) => {
    const acceptedFiles = ['.css', '.js', '.html'];

    const filePath = `${file}`;
    const fileExt = path.extname(filePath);

    // ignore if it is not a supported file
    if (!acceptedFiles.includes(fileExt)) {
      return;
    }

    const fileContent = await readFile(filePath, 'utf-8');

    const updatedContent = cleanupFile(fileContent);

    await writeFile(filePath, updatedContent);
  });
}

async function prettyCode(source: ISource): Promise<void> {
  console.log(colors.cyan(`Prettifying code using ${colors.white('Prettier')}...`));

  return new Promise((resolve, reject) => {
    const cp = exec(`prettier --write ${'temp/' + source.folderName}/**/*`);
    cp.stdout?.on('data', (data) => {
      console.log(`${colors.magenta('[Prettier]')} ${data}`);
    });
    cp.on('close', () => {
      return resolve();
    });
    cp.on('error', (error) => {
      console.log(error);
      return resolve();
    });
  });
}

/**
 * Remove all files from the folder
 * except thoses who are in the exclude list (config.protectedFiles)
 * @param folderPath
 */
async function cleanupTrackingFolder(folderPath: string) {
  console.log(colors.cyan(`Cleaning up repo before scraping ...`));
  await ensureDir(folderPath);
  const files = await readdir(folderPath);
  files.forEach(async (file) => {
    // ignore if the file is protected
    if (config.protectedFiles.includes(file)) {
      return;
    }
    // delete the file
    await rm(`${folderPath}/${file}`, { recursive: true, force: true });
  });
}

async function cloneAndPrepareRepo(source: ISource) {
  const repoUrl = `https://${process.env.GH_TOKEN}@${source.repoUrl}`;
  // remove the folder if it already exists
  if (await pathExists('temp/' + source.folderName)) {
    console.log(colors.cyan(`Cleaning up existing folder:  ${colors.white(String('temp/' + source.folderName))}...`));
    await rm('temp/' + source.folderName, { recursive: true, force: true });
  }

  console.log(colors.cyan(`Cloning remote repository from : ${colors.white(String(source.repoUrl))}...`));
  await git.clone(repoUrl, 'temp/' + source.folderName);
  await cleanupTrackingFolder('temp/' + source.folderName);
}

async function commitFiles(source: ISource) {
  console.log(colors.cyan(`Preparing to commit files to ${colors.white(String(source.repoUrl))}...`));
  await git.cwd('temp/' + source.folderName);
  await git.add('./*');

  const commitMessage = await generateCommitMessage();

  console.log(colors.cyan(`Commit: ${colors.white(commitMessage)}`));
  await git.commit(commitMessage);
  if (isDev) {
    console.log(colors.cyan(`${colors.white('Dev-mode')} ignoring push`));
    return;
  }
  console.log(colors.cyan(`Pushing...`));
  await git.push('origin', 'master', ['--force']);
}

async function generateCommitMessage() {
  const diffMessage = await git.diff(['--cached', '--shortstat']);
  let commitMessage = `${diffMessage} - ${moment().format('MMM Do YYYY, h:mm:ss a')} `;
  commitMessage = commitMessage.split('\n').join('');
  return commitMessage;
}
