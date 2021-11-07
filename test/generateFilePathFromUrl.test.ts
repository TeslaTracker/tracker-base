import { expect } from 'chai';
import { ISource } from '../interfaces/config.interface';
import { generateFilePathFromUrl } from '../utils';

const urls = ['https://tesla.com/fr/test', 'https://tesla.com'];

const source: ISource = {
  folderName: 'testSource',
  name: 'Test Source',
  repoUrl: '',
  urls: [],
};

describe('Testing file path generation from url', () => {
  it('should generate a proper file path from a simple url', () => {
    expect(generateFilePathFromUrl(urls[0], source)).to.equal('temp/testSource/fr/test.html');
  });
  it('should generate a proper file path from an index url', () => {
    expect(generateFilePathFromUrl(urls[1], source)).to.equal('temp/testSource/index.html');
  });
});
