import { shouldScrape } from '../utils';
import { expect } from 'chai';

const domain = 'https://tesla.com';

describe('Testing URL filtering', function () {
  it('should explore an url from the default domain', () => {
    expect(shouldScrape('https://tesla.com/about', domain)).to.equal(true);
    expect(shouldScrape('https://tesla.com/', domain)).to.equal(true);
    expect(shouldScrape('https://tesla.com/medias/icons/favison.png', domain)).to.equal(true);
  });

  it('should NOT explore an url from the French domain', () => {
    expect(shouldScrape('https://tesla.com/fr_fr', domain)).to.equal(false);
    expect(shouldScrape('https://tesla.com/fr_fr/', domain)).to.equal(false);
    expect(shouldScrape('https://tesla.com/fr_fr/medias/img/icon.png', domain)).to.equal(false);
  });
  it('should NOT explore an url from the Canadian domain', () => {
    expect(shouldScrape('https://tesla.com/en_ca', domain)).to.equal(false);
    expect(shouldScrape('https://tesla.com/en_ca/', domain)).to.equal(false);
    expect(shouldScrape('https://tesla.com/en_ca/medias/img/icon.png', domain)).to.equal(false);
  });

  it('should NOT explore an url from the Chinese domain', () => {
    expect(shouldScrape('https://tesla.cn/about', domain)).to.equal(false);
    expect(shouldScrape('https://tesla.cn/en_ca', domain)).to.equal(false);
    expect(shouldScrape('https://tesla.cn/en_ca/medias/img/icon.png', domain)).to.equal(false);
    expect(shouldScrape('https://tesla.cn/medias/img/icon.png', domain)).to.equal(false);
  });

  it('should NOT explore an url that is not part of the Tesla domain', () => {
    expect(shouldScrape('https://google.com/tesla/test', domain)).to.equal(false);
  });

  it('should explore an url that is part of a Tesla subdomain', () => {
    expect(shouldScrape('https://cdn.tesla.com/tesla/test', domain)).to.equal(true);
  });

  it('should explore an url that is part of a another subdomain if specified', () => {
    expect(shouldScrape('https://cdn.google.com/test', 'https://google.com')).to.equal(true);
  });
});
