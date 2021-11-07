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
      values: ['model3', 'models', 'modely', 'modelx', 'powerwall', 'charging', /** maybe ? lol => */ 'model2', 'modelq', 'model4'],
    },
  ],
  sources: [
    {
      name: 'Tesla Website',
      folderName: 'tesla-website',
      repoUrl: 'github.com/TeslaTracker/tesla-website.git',
      baseUrl: 'https://www.tesla.com',
      urls: [
        'https://www.tesla.com',
        'https://www.tesla.com/findus/list/%services%',
        'https://www.tesla.com/%products%',
        'https://www.tesla.com/api/tesla/header/v1',
      ],
    },
    {
      name: 'Tesla Website (China)',
      folderName: 'tesla-website-cn',
      repoUrl: 'github.com/TeslaTracker/tesla-website-china.git',
      baseUrl: 'https://www.tesla.cn',
      urls: [
        'https://www.tesla.cn',
        'https://www.tesla.cn/%products%',
        'https://www.tesla.cn/findus/list/%services%',
        'https://www.tesla.cn/api/tesla/header/v1',
      ],
    },
    {
      name: 'Tesla Website (France)',
      folderName: 'tesla-website-fr',
      repoUrl: 'github.com/TeslaTracker/tesla-website-fr.git',
      baseUrl: 'https://www.tesla.com/fr_fr',
      urls: [
        'https://www.tesla.com/fr_fr',
        'https://www.tesla.com/fr_fr/%products%',
        'https://www.tesla.com/fr_fr/findus/list/%services%',
        'https://www.tesla.com/fr_fr/api/tesla/header/v1',
      ],
    },
  ],
};

export default config;
