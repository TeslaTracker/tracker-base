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
      urls: [
        {
          address: '/',
        },
        {
          address: '/findus/list/%services%',
        },
        {
          address: '/%products%',
        },
        { address: '/%products%/design', shouldGetTeslaStore: true },
      ],
    },

    {
      name: 'Tesla Website FR',
      folderName: 'tesla-website-fr',
      repoUrl: 'github.com/TeslaTracker/tracking-tesla-website-fr.git',
      baseUrl: 'https://www.tesla.com/fr_fr',
      urls: [
        {
          address: '/',
        },
        {
          address: '/findus/list/%services%',
        },
        {
          address: '/%products%',
        },
        { address: '/%products%/design', shouldGetTeslaStore: true },
      ],
    },
    {
      name: 'Tesla Website CN',
      folderName: 'tesla-website-cn',
      repoUrl: 'github.com/TeslaTracker/tracking-tesla-website-china.git',
      baseUrl: 'https://www.tesla.cn',
      urls: [
        {
          address: '/',
        },
        {
          address: '/findus/list/%services%',
        },
        {
          address: '/%products%',
        },
        { address: '/%products%/design', shouldGetTeslaStore: true },
      ],
    },
    {
      name: 'Tesla Web API',
      folderName: 'tesla-web-api',
      repoUrl: 'github.com/TeslaTracker/tracking-tesla-web-api.git',
      baseUrl: 'https://www.tesla.com',
      urls: [
        {
          address: '/api/tesla/header/v1',
        },
        {
          address: '/api/tesla/header/v2',
        },
        {
          address: '/api/tesla/footer/html/v1',
        },
        {
          address: '/api/tesla/footer/html/v2',
        },
        /* other langs */
        {
          address: '/%lang%/api/tesla/header/v1',
        },
        {
          address: '/%lang%/api/tesla/header/v2',
        },
        {
          address: '/%lang%/api/tesla/footer/html/v1',
        },
        {
          address: '/%lang%/api/tesla/footer/html/v2',
        },
      ],
    },
  ],
};

export default config;
