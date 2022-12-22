import fs from "fs/promises";
import ini from "ini";

export interface ConfigSchema {
  core: {
    repositoryformatversion: number;
    filemode: boolean;
    bare: boolean;
  };

  remote?: any;
}

export const DEFAULT_CONFIG: ConfigSchema = {
  core: {
    repositoryformatversion: 0,
    filemode: false,
    bare: false,
  },
};

export const encode = ini.encode;
export const decode = ini.decode;

export class Config {
  public static async load(path: string): Promise<Config> {
    const config = new Config(path);

    await config.load();

    return config;
  }

  constructor(
    public path: string,
    public data: ConfigSchema = DEFAULT_CONFIG
  ) {}

  public async load() {
    const decoded = ini.decode(await fs.readFile(this.path, "utf8"));

    decoded.core ??= {};
    decoded.core.repositoryformatversion ??= 0;
    decoded.core.filemode ??= false;
    decoded.core.bare ??= false;

    this.data = decoded;
  }

  public async save() {
    const encoded = ini.encode(this.data);

    await fs.writeFile(this.path, encoded);
  }
}
