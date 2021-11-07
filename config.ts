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
      repoUrl: 'github.com/TeslaTracker/tracking-tesla-website.git',
      urls: [
        'https://www.tesla.com',
        'https://www.tesla.com/findus/list/%services%',
        'https://www.tesla.com/%lang%',
        'https://www.tesla.com/%lang%/%products%',
        'https://www.tesla.cn',
        'https://www.tesla.cn/%products%',
        'https://www.tesla.cn/findus/list/%services%',
      ],
    },
  ],
};

export default config;
