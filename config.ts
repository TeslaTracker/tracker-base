import IConfig from './interfaces/config.interface';

const config: IConfig = {
  protectedFiles: ['README.md', '.git', '.gitignore'],
  variables: [
    {
      name: 'lang',
      values: ['fr_fr', 'en_gb', 'es_es', 'de_de'],
    },
    {
      name: 'services',
      values: ['superchargers', 'stores', 'services'],
    },
    {
      name: 'products',
      values: [
        'model3',
        'models',
        'modely',
        'modelx',
        'powerwall',
        'solarroof',
        'solarpanels',
        'roadster',
        'charging',
        'cybertruck',
        /** futur stuff maybe ? :o) */
        'model2',
        'modelq',
        'model4',
      ],
    },
  ],
  sources: [
    {
      name: 'Tesla Website',
      folderName: 'tesla-website',
      repoUrl: 'github.com/TeslaTracker/tracking-tesla-website.git',
      baseUrl: 'https://www.tesla.com',
      urls: ['/', '/findus/list/%services%', '/%products%'],
    },
    {
      name: 'Tesla Website (China)',
      folderName: 'tesla-website-china',
      repoUrl: 'github.com/TeslaTracker/tracking-tesla-website-china.git',
      baseUrl: 'https://www.tesla.cn',
      urls: ['/', '/%products%', '/findus/list/%services%'],
    },
    {
      name: 'Tesla Website (France)',
      folderName: 'tesla-website-fr',
      repoUrl: 'github.com/TeslaTracker/tracking-tesla-website-fr.git',
      baseUrl: 'https://www.tesla.com/fr_fr',
      urls: ['/', '/%products%', '/findus/list/%services%'],
    },
    {
      name: 'Tesla Web API',
      folderName: 'tesla-web-api',
      repoUrl: 'github.com/TeslaTracker/tracking-tesla-web-api.git',
      baseUrl: 'https://www.tesla.com/api',
      urls: ['/tesla/header/v1', '/tesla/header/v2', '/tesla/footer/html/v1', '/tesla/footer/html/v2'],
    },
  ],
};

export default config;
