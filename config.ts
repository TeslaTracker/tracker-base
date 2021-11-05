import IConfig from './interfaces/config.interface';

const config: IConfig = {
  protectedFiles: ['README.md', '.git', '.gitignore'],
  sources: [
    {
      name: 'Tesla Website',
      folderName: 'tesla-website',
      repoUrl: 'github.com/TeslaTracker/tracking-tesla-website.git',
      variables: [
        {
          name: 'lang',
          values: ['fr_FR', 'en_US', 'es_ES', 'de_DE', 'it_IT', 'ja_JP', 'ko_KR', 'zh_CN', 'zh_TW', 'ru_RU', 'pt_BR'],
        },
        {
          name: 'listItems',
          values: ['superchargers', 'stores', 'services'],
        },
      ],
      urls: [
        'https://www.tesla.com',
        'https://www.tesla.com/findus/list/%listItems%',
        'https://www.tesla.com/%lang%',
        'https://www.tesla.com/%lang%/findus/list/%listItems%',
        'https://www.tesla.cn',
        'https://www.tesla.cn/findus/list/%listItems%',
      ],
    },
  ],
};

export default config;
