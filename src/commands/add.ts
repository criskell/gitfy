import fs from 'fs/promises';
import nodePath from 'path';

import { ObjectStore } from '../objects/store';
import { IndexStore, createIndexEntry } from '../staging';
import { listFiles } from '../util/filesystem';
import { GitObject, Blob } from '../objects';

export interface AddCommand {
  path: string;
}

export interface AddParams extends AddCommand {
  rootDirectory: string;
  objectStore: ObjectStore;
  indexStore: IndexStore;
}

export const add = async ({ path, rootDirectory, objectStore, indexStore }: AddParams): Promise<void> => {
  const startPath = nodePath.resolve(rootDirectory, path);

  const matchedFiles = (await fs.lstat(startPath)).isDirectory()
    ? await listFiles(startPath)
    : [startPath];

  const addFile = async (path: string): Promise<void> => {
    const content = await fs.readFile(path);
    const blobObject = await objectStore.add(GitObject.from(new Blob(content)));
    const relativePath = nodePath.relative(rootDirectory, path);
    const indexEntry = await createIndexEntry(
      rootDirectory,
      relativePath,
      blobObject.id
    );

    indexStore.index.add(indexEntry);
  };

  await Promise.all(matchedFiles.map(addFile));
  await indexStore.save();
};
