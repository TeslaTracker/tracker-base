import { findIndex } from 'lodash';
import { ISource } from './interfaces/config.interface';

export function generateUrlsList(source: ISource): string[] {
  let urls: string[] = [];
  source.urls.forEach((url) => {
    urls = urls.concat(hydrateUrl(url, source));
  });
  return urls;
}

function hydrateUrl(url: string, source: ISource): string[] {
  const variableRegex = new RegExp('%(.*?)%', 'g');
  let urls: string[] = [];
  // list all parameters in the url
  const urlVariables = url.match(variableRegex);

  // if there is not match, the url is complete => return it
  if (!urlVariables) {
    return [url];
  }

  // loop through all parameters
  if (source.variables && urlVariables) {
    urlVariables.forEach((variableMatch) => {
      // %toto% => toto
      const match = variableMatch.replace('%', '').replace('%', '');

      const variableIndex = findIndex(source.variables, { name: match });

      // skip if the variable don't exist in the source
      if (!~variableIndex) {
        urls.push(url);
        return urls;
      }

      const variableValues = source.variables[variableIndex].values;

      // ex: en_EN - fr_FR
      for (const value of variableValues) {
        const baseUrl = url.replace(variableMatch, value);
        urls = urls.concat(hydrateUrl(baseUrl, source));
      }
    });
  }
  return urls;
}

export function cleanupFile(content: string): string {
  // replace favicon_1.png with favicon.png
  const duplicatedFileRegex = new RegExp(`_[0-9].`, 'gm');
  content = content.replace(duplicatedFileRegex, '.');

  // remove the nonce parameter from the script tags
  const nonceRegex = new RegExp(` nonce="(.)*?"`, 'gm');
  content = content.replace(nonceRegex, '');

  return content;
}
