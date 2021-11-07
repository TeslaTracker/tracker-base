import config from './config';
import { rm, readdir, pathExists, readFile, writeFile, ensureFile, appendFile, ensureDir } from 'fs-extra';
import colors from 'colors';
import { exec } from 'child_process';
import simpleGit from 'simple-git';
import { ISource } from './interfaces/config.interface';
import moment from 'moment';
import { cleanupFile, generateFilePathFromUrl, generateUrlsList, gitHasChanges } from './utils';
import recursive from 'recursive-readdir';
import path from 'path';
import { Cluster } from 'puppeteer-cluster';
import { Command } from 'commander';
import { findIndex } from 'lodash';
const program = new Command();

program.option('-s, --source <source>', 'Specify the source to process', '').option('-np, --noPretty', 'Skip prettier');

program.parse(process.argv);

const options = program.opts();

const isDev = process.env.DEV;
const dummyDomain = 'https://cyriaque.net';
console.log('Starting scrap process...');
const git = simpleGit();

if (!process.env.GH_TOKEN) {
  throw new Error(colors.red('MISSING GH_TOKEN env var'));
}

if (isDev) {
  console.log(colors.yellow(`-- Dev mode enabled --`));
  console.log(`${colors.cyan(`🛈 Changes won't be pushed`)}`);
}

if (options.noPretty) {
  console.log(colors.yellow(`-- Prettier will be skipped --`));
}

// set the selected sourc if provided in CLI
let selectedSources = config.sources;

if (options.source) {
  const sourceIndex = findIndex(config.sources, { folderName: options.source });
  if (~sourceIndex) {
    selectedSources = [config.sources[sourceIndex]];
  }
}

processSources(selectedSources);

async function processSources(sources: ISource[]) {
  console.log(`Active sources :`);
  sources.forEach((source) => {
    console.log(`${colors.magenta(source.name)}`);
  });

  for (const source of sources) {
    await processSource(source);
  }
}

function processSource(source: ISource): Promise<void> {
  return new Promise(async (resolve) => {
    await cloneAndPrepareRepo(source);

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
      console.log(`[${colors.magenta(source.name)}]`, colors.cyan(`Processing ${colors.white(url)}...`));
      const response = await page.goto(url);

      if (response.status() !== 200) {
        console.log(`[${colors.magenta(source.name)}]`, colors.yellow(`Not available (${response.status()}) ${colors.white(url)}`));
        return;
      }

      const contentType = response.headers()['content-type'];

      let dataToWrite = '';
      await page.waitForSelector('body');

      // only download body content for html pages
      if (contentType.includes('text/html')) {
        dataToWrite = await page.evaluate(() => document.body.innerHTML);
      } else {
        // else, process the whole file
        dataToWrite = await response.text();
      }

      const filePath = generateFilePathFromUrl(url, source, contentType);

      if (await pathExists(filePath)) {
        console.log(`[${colors.magenta(source.name)}]`, colors.yellow(`File already exists: ${colors.white(filePath)}`));
        return;
      }

      // ensure the folder hierarchy
      await ensureFile(filePath);

      // write the body content in a file
      await writeFile(filePath, dataToWrite);
      await page.close();
      availablePages.push(filePath);
      return;
    });

    urlsList.forEach(async (url) => {
      cluster.queue(url);
    });

    await cluster.idle();
    await cluster.close();

    console.log(`[${colors.magenta(source.name)}]`, colors.cyan(`Browsing complete for ${source.name} - generating manifest file...`));

    const manifestFile = `temp/${source.folderName}/manifest.txt`;
    await ensureFile(manifestFile);
    //sort the result array for consistency
    availablePages.sort();

    // log the results into a file
    availablePages.forEach(async (page) => {
      // only add the page to the manifest if it was available
      await appendFile(manifestFile, `${page}\n`);
    });
    if (!options.noPretty) {
      await prettyCode(source);
    }

    await cleanupFiles(source);
    await commitFiles(source);
    return resolve();
  });
}

/**
 * Try to detect rng and duplicated values and clean them
 */
async function cleanupFiles(source: ISource) {
  console.log(`[${colors.magenta(source.name)}]`, colors.cyan(`Cleaning up files...`));
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
  console.log(`[${colors.magenta(source.name)}]`, colors.cyan(`Prettifying code using ${colors.white('Prettier')}...`));

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
async function cleanupTrackingFolder(source: ISource, folderPath: string) {
  console.log(`[${colors.magenta(source.name)}]`, colors.cyan(`Cleaning up repo before scraping ${colors.white(folderPath)} ...`));
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
  await git.cwd(__dirname);

  const repoUrl = `https://${process.env.GH_TOKEN}@${source.repoUrl}`;
  // remove the folder if it already exists
  if (await pathExists('temp/' + source.folderName)) {
    console.log(
      `[${colors.magenta(source.name)}]`,
      colors.cyan(`Cleaning up existing folder:  ${colors.white(String('temp/' + source.folderName))}...`)
    );
    await rm('temp/' + source.folderName, { recursive: true, force: true });
  }

  console.log(`[${colors.magenta(source.name)}]`, colors.cyan(`Cloning remote repository from : ${colors.white(String(source.repoUrl))}...`));
  await git.clone(repoUrl, 'temp/' + source.folderName);
  await cleanupTrackingFolder(source, 'temp/' + source.folderName);
}

async function commitFiles(source: ISource) {
  console.log(`[${colors.magenta(source.name)}]`, colors.cyan(`Preparing to commit files to ${colors.white(String(source.repoUrl))}...`));
  console.log(`[${colors.magenta(source.name)}]`, colors.cyan('git cwd temp/' + source.folderName));
  await git.cwd('temp/' + source.folderName);

  // delete lock file if it exists
  if (await pathExists('.git/index.lock')) {
    await rm('.git/index.lock', { force: true });
  }

  if (await gitHasChanges(git)) {
    console.log(`[${colors.magenta(source.name)}]`, colors.cyan('Changes detected'));
  } else {
    console.log(`[${colors.magenta(source.name)}]`, colors.cyan('No changes to commit'));
    return;
  }

  console.log(`[${colors.magenta(source.name)}]`, colors.cyan('git add .'));
  // add all changes
  await git.add('.');

  // create the commit message
  const commitMessage = await generateCommitMessage();

  console.log(`[${colors.magenta(source.name)}]`, colors.cyan(`Commit: ${colors.white(commitMessage)}`));
  await git.commit(commitMessage);
  if (isDev) {
    console.log(colors.cyan(`${colors.white('Dev-mode')} ignoring push`));
    return;
  }
  console.log(`[${colors.magenta(source.name)}]`, colors.cyan(`Pushing...`));
  await git.push('origin', 'master', ['--force']);
}

async function generateCommitMessage() {
  let diffMessage = await git.diff(['--cached', '--shortstat']);

  if (!diffMessage) {
    diffMessage = 'No changes detected';
  }

  let commitMessage = `${diffMessage} - ${moment().format('MMM Do YYYY, h:mm:ss a')} `;
  commitMessage = commitMessage.split('\n').join('');

  return commitMessage;
}
