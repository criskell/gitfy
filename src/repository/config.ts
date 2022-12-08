import fs from "fs/promises";
import ini from "ini";

export interface ConfigSchema {
  core: {
    repositoryformatversion: number;
    filemode: boolean;
    bare: boolean;
  };
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
    const decoded = ini.decode(await fs.readFile(path, "utf8"));

    decoded.core ??= {};
    decoded.core.repositoryformatversion ??= 0;
    decoded.core.filemode ??= false;
    decoded.core.bare ??= false;

    return new Config(path, decoded);
  }

  constructor(
    public path: string,
    public data: ConfigSchema = DEFAULT_CONFIG
  ) {}

  public async save() {
    const encoded = ini.encode(this.data);

    await fs.writeFile(this.path, encoded);
  }
}
