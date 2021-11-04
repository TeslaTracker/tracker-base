import { Options } from 'website-scraper';
export interface ISource {
  name: string;
  folderName: string;
  repoUrl: string;
  options: Options;
}
export default interface IConfig {
  protectedFiles: string[];
  sources: ISource[];
}
