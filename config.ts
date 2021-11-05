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
      ],
      urls: [
        'https://www.tesla.com/%lang%',
        'https://www.tesla.com/%lang%/findus/list/superchargers',
        'https://www.tesla.com/%lang%/findus/list/stores',
        'https://www.tesla.com/%lang%/findus/list/services',
      ],
    },
  ],
};

export default config;
