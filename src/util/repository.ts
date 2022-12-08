import fs from "fs/promises";
import nodePath from "path";

import { exists } from "./filesystem";

export const findGitDirectory = async (
  path: string
): Promise<string | null> => {
  const gitDirectory = nodePath.join(path, ".git");

  if (
    (await exists(gitDirectory)) &&
    (await fs.lstat(gitDirectory)).isDirectory()
  ) {
    return gitDirectory;
  }

  const configPath = nodePath.join(path, "config");

  if ((await exists(configPath)) && (await fs.lstat(configPath)).isFile()) {
    const config = await fs.readFile(configPath, "utf8");

    if (config.includes("core")) return path;
  }

  return path === "/" ? null : findGitDirectory(nodePath.dirname(path));
};
