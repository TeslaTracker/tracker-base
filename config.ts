import { Options } from 'website-scraper';
import IConfig from './interfaces/config.interface';
const SaveToExistingDirectoryPlugin = require('website-scraper-existing-directory');
import { shouldScrape } from './utils';
const defaultOptions: Options = {
  urls: ['https://www.tesla.com'],
  urlFilter: function (url) {
    return shouldScrape(url);
  },
  directory: __dirname + '/scrap',
  recursive: true,
  ignoreErrors: true,
  plugins: [new SaveToExistingDirectoryPlugin()],
  maxRecursiveDepth: 2,
};
const config: IConfig = {
  protectedFiles: ['README.md', '.git', '.gitignore'],
  sources: [
    {
      name: 'Tesla Website',
      folderName: 'tesla-website',
      repoUrl: 'github.com/TeslaTracker/tracking-tesla-website.git',
      options: { ...defaultOptions, urls: ['https://www.tesla.com'] },
    },
  ],
};

export default config;
