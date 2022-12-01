import fs from "fs/promises";
import ini from "ini";

interface Config {
  core: {
    repositoryformatversion: number;
    filemode: boolean;
    bare: boolean;
  }
}

export const DEFAULT_CONFIG: Config = {
  core: {
    repositoryformatversion: 0,
    filemode: false,
    bare: false,
  }
};

export const encode = ini.encode;
export const decode = ini.decode;

export const fetch = async (path: string): Promise<Config> => {
  const decoded = decode(await fs.readFile(path, "utf8"));
  
  decoded.core ??= {};
  decoded.core.repositoryformatversion ??= 0;
  decoded.core.filemode ??= false;
  decoded.core.bare ??= false;

  return decoded;
};

export const save = async (path, config: Config): Promise<void> => {
  const encoded = encode(config);

  await fs.writeFile(path, encoded);
};