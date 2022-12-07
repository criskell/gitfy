import nodePath from 'path';

export class PathBuilder {
  private rootPath: string;
  private gitPath: string;
  private configPath: string;
  private objectsPath: string;

  constructor(rootPath: string, isBare: boolean = false) {
    this.rootPath = rootPath;
    this.gitPath = isBare ? rootPath : `${rootPath}/.git`;
    this.configPath = nodePath.join(rootPath, 'config');
    this.objectsPath = nodePath.join(rootPath, 'objects');
  }

  public get root() {
    return this.rootPath;
  }

  public get git() {
    return this.gitPath;
  }

  public get config() {
    return this.configPath;
  }

  public get objects() {
    return this.objectsPath;
  }

  public object(id: string) {
    return nodePath.join(this.objectsPath, this.id);
  }
}
