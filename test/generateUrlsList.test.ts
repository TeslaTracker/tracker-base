import { generateUrlsList } from '../utils';
import { expect } from 'chai';
import IConfig, { ISource } from '../interfaces/config.interface';

const config: IConfig = {
  protectedFiles: [],
  sources: [
    {
      folderName: 'test',
      name: 'test Source',
      repoUrl: '',
      urls: ['https://test-url.com/%lang%/about', 'https://test-url.com/%lang%/user/%username%?debug=%debug%'],
    },
  ],
  variables: [
    {
      name: 'lang',
      values: ['en_EN', 'fr_FR'],
    },
    {
      name: 'username',
      values: ['JohnDoe', 'ElonMusk'],
    },
    {
      name: 'debug',
      values: ['true', 'false'],
    },
  ],
};

describe('Testing URLs generation with variables parameters', () => {
  it('should generate a list of urls for one parameter', () => {
    // only 1 url that take 1 variable with 2 values
    let source1 = { ...config.sources[0] };
    source1.urls = [source1.urls[0]];
    expect(generateUrlsList(source1, config)).lengthOf(2);
  });

  it('should generate a list of urls for multiple parameters', () => {
    const res = generateUrlsList(config.sources[0], config);
    expect(res).lengthOf(50);
    expect(res).to.contain('https://test-url.com/fr_FR/user/ElonMusk?debug=false');
    expect(res).to.contain('https://test-url.com/en_EN/user/JohnDoe?debug=true');
  });

  it('should not replace url param if there is no corresponding variable', () => {
    let source1 = { ...config.sources[0] };
    source1.urls = ['https://test-no-var/%20%', 'https://image%error%.png'];
    const res = generateUrlsList(source1, config);
    expect(res).lengthOf(2);
    expect(res).to.contain('https://test-no-var/%20%');
    expect(res).to.contain('https://image%error%.png');
  });
});
