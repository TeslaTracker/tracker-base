import { findIndex } from 'lodash';
import IConfig, { ISource, IUrlConfig } from './interfaces/config.interface';
import mime from 'mime-types';
import { SimpleGit } from 'simple-git';
export function generateUrlsList(source: ISource, config: IConfig): IUrlConfig[] {
  let urls: IUrlConfig[] = [];
  source.urls.forEach((urlConfig) => {
    urls = urls.concat(hydrateUrl(urlConfig, source, config));
  });

  // add the domain base to all parsed urls
  urls.forEach((urlConfig, configIndex) => {
    urls[configIndex].address = `${source.baseUrl}${urlConfig.address}`;
  });

  return urls;
}

function hydrateUrl(urlConfig: IUrlConfig, source: ISource, config: IConfig): IUrlConfig[] {
  const variableRegex = new RegExp('%(.*?)%', 'g');
  let urlConfigs: IUrlConfig[] = [];

  // list all parameters in the url
  const urlVariables = urlConfig.address.match(variableRegex);

  // if there is not match, the url is complete => return it
  if (!urlVariables) {
    return [urlConfig];
  }

  // loop through all parameters
  if (config.variables && urlVariables) {
    urlVariables.forEach((variableMatch) => {
      // %toto% => toto
      const match = variableMatch.replace('%', '').replace('%', '');

      const variableIndex = findIndex(config.variables, { name: match });

      // skip if the variable don't exist in the source
      if (!~variableIndex) {
        urlConfigs.push(urlConfig);
        return urlConfigs;
      }

      const variableValues = config.variables[variableIndex].values;

      // ex: en_EN - fr_FR
      for (const value of variableValues) {
        const baseConfig = { ...urlConfig, address: urlConfig.address.replace(variableMatch, value) };
        urlConfigs = urlConfigs.concat(hydrateUrl(baseConfig, source, config));
      }
    });
  }
  return urlConfigs;
}

export function cleanupFile(content: string): string {
  // replace favicon_1.png with favicon.png
  const duplicatedFileRegex = new RegExp(`_[0-9].`, 'gm');
  content = content.replace(duplicatedFileRegex, '.');

  // remove the nonce parameter from the script tags
  const nonceRegex = new RegExp(` nonce="(.)*?"`, 'gm');
  content = content.replace(nonceRegex, '');

  // remove the permission hash from drupal
  const permissionHashRegex = new RegExp(`"permissionsHash": "(.)*?"`, 'gm');
  content = content.replace(permissionHashRegex, '"permissionsHash": ""');

  return content;
}

/**
 * Generate a full file path from a given url
 * @param url
 * @param source
 */
export function generateFilePathFromUrl(urlConfig: IUrlConfig, source: ISource, contentType: string): string {
  // Note

  // Tesla does not use file extension withing their website but it can be problematic in the futur...

  // // remove existing file extension
  // const existingExt = path.parse(url).ext;
  // if (existingExt) {
  //   url = url.replace(existingExt, '');
  // }

  const base = source.baseUrl;
  let ext = mime.extension(contentType);

  if (!ext) {
    ext = 'txt';
  }

  // force json if object evaluation
  if (urlConfig.shouldGetTeslaStore) {
    ext = 'json';
  }

  let fileName = urlConfig.address.replace(base, '');
  // handle "index" files
  if (!fileName || fileName === '/') {
    fileName = '/index';
  }
  return `temp/${source.folderName}${fileName}.${ext}`;
}

/**
 * Tell wether of not the git instance has changed files
 * @param git
 * @returns
 */
export async function gitHasChanges(git: SimpleGit): Promise<boolean> {
  const diff = await git.raw(['ls-files', '--deleted', '--modified', '--others', '--exclude-standard']);

  if (diff) {
    return true;
  }
  return false;
}
