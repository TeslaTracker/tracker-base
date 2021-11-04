import scrape from 'website-scraper'; // only as ESM, no CommonJS
import config from './config';
import { rm, readdir, pathExists, readFile, writeFile } from 'fs-extra';
import colors from 'colors';
import { exec } from 'child_process';
import simpleGit from 'simple-git';
import { ISource } from './interfaces/config.interface';
import moment from 'moment';
import { cleanupFile } from './utils';

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

config.sources.forEach((source, sourceIndex) => {
  source.options.urls.forEach(async (url) => {
    // dummy url for dev mode
    if (isDev) {
      url = 'https://cyriaque.net';
      config.sources[sourceIndex].options.urls = [url];
    }

    await cloneAndPrepareRepo(source);
    // update the scrap options to use the folder name
    source.options.directory = 'temp/' + source.folderName;

    console.log(colors.cyan(`Scrapping from ${colors.white(String(url))}...`));
    scrape(source.options).then(async (result) => {
      result.forEach((item) => {
        console.log(colors.cyan(`Scrapped ${colors.white(String(item.url))}`));
      });
      await cleanupFiles(source);
      await prettyCode(source);
      await commitFiles(source);
    });
  });
});

/**
 * Try to detect rng and duplicated values and clean them
 */
async function cleanupFiles(source: ISource) {
  console.log(colors.cyan(`Cleaning up files...`));
  const dir = `temp/${source.folderName}`;
  const files = await readdir(dir);

  files.forEach(async (file) => {
    const filePath = `${dir}/${file}`;
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
