import nodePath from "path";
import fs from "fs/promises";

type Tree = {
  [name: string]: Tree | string;
};

export const createTree = async (tree: Tree, baseDirectory?: string) => {
  const dir = baseDirectory || process.cwd();

  await fs.mkdir(dir, { recursive: true });

  return await Promise.all(
    Object.entries(tree).map(([name, contents]) => {
      const path = nodePath.join(dir, name);

      if (typeof contents === "string") {
        return fs.writeFile(path, contents);
      }

      return fs
        .mkdir(path, { recursive: true })
        .then(() => createTree(contents, path));
    })
  );
};

export const exists = async (path: string): Promise<boolean> =>
  !!(await fs.stat(path).catch((error) => false));

export const listFiles = (directory: string) =>
  fs
    .readdir(directory, { withFileTypes: true })
    .then((entries) =>
      Promise.all(
        entries.map((entry) =>
          entry.isFile()
            ? nodePath.join(directory, entry.name)
            : listFiles(nodePath.join(directory, entry.name))
        )
      )
    )
    .then((entries) => entries.flat(Infinity));
