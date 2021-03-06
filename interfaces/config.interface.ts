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
   * Base url of the source
   */
  baseUrl: string;

  /**
   * A list of urls that will be used
   *
   * Using a %varName% variable will loop through the list of the corresponsing var
   *
   */
  urls: IUrlConfig[];
}

export interface IUrlConfig {
  address: string;
  /**
   * If provided try to retrieve the window.tesla object
   *
   * The outFile will also be a json file
   *
   */
  shouldGetTeslaStore?: boolean;
  // override the out file name
  outFile?: string;
}
export default interface IConfig {
  protectedFiles: string[];
  sources: ISource[];
  /**
   * A collection of variables that can be used withing the urls
   */
  variables: IVariable[];
}

export interface IVariable {
  name: string;
  values: string[];
}
