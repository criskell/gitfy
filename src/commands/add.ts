import fs from "fs/promises";
import nodePath from "path";

import { Repository } from "../repository";
import { IndexStore, createIndexEntry } from "../staging";
import { listFiles } from "../util/filesystem";
import { GitObject, Blob } from "../objects";

export interface AddCommand {
  path: string;
}

export const add = async (repo: Repository, command: AddCommand): Promise<void> => {
  const startPath = nodePath.resolve(repo.path.root, command.path);

  const matchedFiles = (await fs.lstat(startPath)).isDirectory()
    ? await listFiles(startPath)
    : [startPath];

  const addFile = async (path: string): Promise<void> => {
    const content = await fs.readFile(path);
    const blobObject = await repo.objectStore.add(GitObject.from(new Blob(content)));
    const relativePath = nodePath.relative(repo.path.root, path);
    const indexEntry = await createIndexEntry(
      repo.path.root,
      relativePath,
      blobObject.id
    );

    repo.indexStore.index.add(indexEntry);
  };

  await Promise.all(matchedFiles.map(addFile));
  await repo.indexStore.save();
};
