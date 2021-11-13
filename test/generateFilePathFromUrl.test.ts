import { expect } from 'chai';
import { ISource, IUrlConfig } from '../interfaces/config.interface';
import { generateFilePathFromUrl } from '../utils';

const urls: IUrlConfig[] = [
  {
    address: 'https://tesla.com/fr/test',
  },
  {
    address: 'https://tesla.com',
  },
  {
    address: 'https://tesla.com/api/test',
  },
];

const source: ISource = {
  folderName: 'testSource',
  name: 'Test Source',
  baseUrl: 'https://tesla.com',
  repoUrl: '',
  urls: [],
};

const textHtml = 'text/html';

describe('Testing file path generation from url', () => {
  it('should generate a proper file path from a simple url', () => {
    expect(generateFilePathFromUrl(urls[0], source, textHtml)).to.equal('temp/testSource/fr/test.html');
  });

  it('should generate a proper file path from an index url', () => {
    expect(generateFilePathFromUrl(urls[1], source, textHtml)).to.equal('temp/testSource/index.html');
  });

  it('should generate a txt file when there is no content-type', () => {
    expect(generateFilePathFromUrl(urls[0], source, '')).to.equal('temp/testSource/fr/test.txt');
  });

  const source1 = { ...source, baseUrl: 'https://tesla.com/fr' };
  it('should generate a proper file path considering the base url', () => {
    expect(generateFilePathFromUrl(urls[0], source1, textHtml)).to.equal('temp/testSource/test.html');
  });

  const source2 = { ...source, baseUrl: 'https://tesla.com/fr/test' };
  it('should generate a proper file path considering the base url', () => {
    expect(generateFilePathFromUrl(urls[0], source2, textHtml)).to.equal('temp/testSource/index.html');
  });

  it('should generate a proper file path for a json file', () => {
    expect(generateFilePathFromUrl(urls[2], source, 'application/json')).to.equal('temp/testSource/api/test.json');
  });
});
