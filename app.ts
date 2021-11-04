import scrape from 'website-scraper'; // only as ESM, no CommonJS
import config from './config';
import { rm, readdir, pathExists } from 'fs-extra';
import colors from 'colors';
import { exec } from 'child_process';
import simpleGit from 'simple-git';
import { ISource } from './interfaces/config.interface';
import moment from 'moment';
console.log('Starting scrap process...');
const git = simpleGit();

if (!process.env.GH_TOKEN) {
  throw new Error(colors.red('MISSING GH_TOKEN env var'));
}

if (!process.env.GIT_USER_NAME) {
  throw new Error(colors.red('MISSING GIT_USER_NAME env var'));
}

if (!process.env.GIT_USER_EMAIL) {
  throw new Error(colors.red('MISSING GIT_USER_EMAIL env var'));
}

initGIt().then(() => {
  config.sources.forEach((source) => {
    source.options.urls.forEach(async (url) => {
      await cloneAndPrepareRepo(source);
      // update the scrap options to use the folder name
      source.options.directory = 'temp/' + source.folderName;

      console.log(colors.cyan(`Scrapping from ${colors.white(String(url))}...`));
      scrape(source.options).then(async (result) => {
        result.forEach((item) => {
          console.log(colors.cyan(`Scrapped ${colors.white(String(item.url))}`));
        });
        await prettyCode(source);
        await commitFiles(source);
      });
    });
  });
});

async function initGIt() {
  await git.addConfig('user.name', String(process.env.GIT_USER_NAME), false, 'global');
  await git.addConfig('user.email', String(process.env.GIT_USER_EMAIL), false, 'global');
  const user = await git.getConfig('user.name');
  const email = await git.getConfig('user.email');
  console.log(colors.cyan(`Config set :`));
  console.log(colors.cyan(`user.name: ${colors.white(String(user.value))}`));
  console.log(colors.cyan(`user.email: ${colors.white(String(email.value))}`));
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
  console.log(colors.cyan(`Commiting files to ${colors.white(String(source.repoUrl))}...`));
  await git.cwd('temp/' + source.folderName);
  await git.commit(`update from ${moment().format('MMMM Do YYYY, h:mm:ss a')} `);
  await git.push('origin', 'master');
}
