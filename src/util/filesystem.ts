import nodePath from "path";
import fs from "fs/promises";

type Tree = {
  [name: string]: Tree | string;
};

export const createTree = async (tree: Tree, baseDirectory?: string) => {
  const dir = baseDirectory || process.cwd();

  return Promise.all(Object.entries(tree).map((name, contents) => {
    const path = nodePath.join(baseDirectory, name);

    if (typeof contents === "string") {
      return writeFile(path, contents);
    } 

    return mkdir(path, { recursive: true }).then(() => createTree(contents, path));
  }));
};

export const exists = async (path: string): Promise<boolean> => {
  try {
    await access(path, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
};