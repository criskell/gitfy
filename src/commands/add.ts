import fs from "fs/promises";

import { ObjectStore } from "../objects/store";
import { IndexStore, createIndexEntry } from "../staging";
import { listFiles } from "../util/filesystem";
import { GitObject, Blob } from "../objects";

export interface AddFilesRequest {
  path: string;
}

export const add = (objectStore: ObjectStore, indexStore: IndexStore) =>
  async (request: AddFilesRequest): Promise<void> => {
  const matchedFiles = (await fs.lstat(request.path)).isDirectory()
    ? await listFiles(request.path)
    : [request.path];

  const addFile = async (path: string): Promise<void> => {
    const content = await fs.readFile(path);
    const blobObject = await objectStore.add(GitObject.from(new Blob(content)));
    const indexEntry = await createIndexEntry(path, blobObject.id);

    indexStore.index.add(indexEntry);
  };

  await Promise.all(matchedFiles.map(addFile));
  await indexStore.save();
};