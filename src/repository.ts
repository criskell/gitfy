import { DEFAULT_CONFIG, Config } from './config';

export class Repository {
  public gitDirectoryPath: string;
  public config: Config;

  constructor(gitDirectoryPath: string, config: Config = DEFAULT_CONFIG) {
    this.gitDirectoryPath = gitDirectoryPath;
    this.config = config;
  }
}
