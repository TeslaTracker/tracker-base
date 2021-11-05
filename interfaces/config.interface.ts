export interface ISource {
  /**
   * Name of the source
   */
  name: string;
  /**
   * Name of the temp folder
   */
  folderName: string;
  /**
   * Github repo where the results will be pushed
   */
  repoUrl: string;
  /**
   * A collection of variables that can be used withing the urls
   */
  variables: IVariable[];
  /**
   * A list of urls that will be used
   *
   * Using a %varName% variable will loop through the list of the corresponsing var
   *
   */
  urls: string[];
}
export default interface IConfig {
  protectedFiles: string[];
  sources: ISource[];
}

export interface IVariable {
  name: string;
  values: string[];
}
