import fs from "fs/promises";
import nodePath from "path";

import { ObjectStore } from "../objects/store";
import { IndexStore  } from "../staging";
import { GitObject, Commit, Tree, Blob } from "../objects";

interface CommitRequest {
  message: string;
  author: string;
}

interface CommitResponse {
  commitId: string;
}

export const add = (objectStore: ObjectStore, indexStore: IndexStore) =>
  async (request: CommitRequest): Promise<CommitResponse> => {
  const indexEntries = indexStore.index.entries();

  const createTreeFromIndex = async (): string => {
    const filesByDir = new Map();

    for (const indexEntry of indexEntries) {
      const dirname = nodePath.dirname(indexEntry.path);
      const children = filesByDir.get(dirname) || new Tree();

      children.entries.push(indexEntry);

      filesByDir.set(dirname, children);
    }
  };

  const message = request.message;
  const treeId = await createTreeFromIndex();
  const author = request.author;
  const committer = request.committer;

  const commit = new Commit(
    message,
    treeId,
    author,
    committer
  );
};