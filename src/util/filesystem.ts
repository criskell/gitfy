import nodePath from "path";
import fs from "fs/promises";

type Tree = {
  [name: string]: Tree | string;
};

export const createTree = async (tree: Tree, baseDirectory?: string) => {
  const dir = baseDirectory || process.cwd();

  return Promise.all(Object.entries(tree).map(([name, contents]) => {
    const path = nodePath.join(dir, name);

    if (typeof contents === "string") {
      return fs.writeFile(path, contents);
    } 

    return fs.mkdir(path, { recursive: true })
      .then(() => createTree(contents, path));
  }));
};

export const exists = async (path: string): Promise<boolean> =>
  !!(await fs.stat(path).catch(error => false));