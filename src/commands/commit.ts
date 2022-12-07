import nodePath from "path";

import { ObjectStore } from "../objects/store";
import { IndexEntry, IndexStore } from "../staging";
import { GitObject, Commit, Tree, Blob } from "../objects";
import { TreeEntry } from "../objects/body/tree";

interface CommitRequest {
  message: string;
  author: string;
}

interface CommitResponse {
  commitId: string;
}

export const commit =
  (objects: ObjectStore, indexStore: IndexStore) =>
  async (request: CommitRequest): Promise<CommitResponse> => {
    const indexEntries = indexStore.index.entries();

    const snapshot = snapshotFromEntries(indexEntries);
    const tree = await createTreeObject(
      objects,
      snapshot.get(".") as SnapshotDirectory
    );
    const message = request.message;
    const author = request.author;
    const committer = request.author;
    const parentIds = [];
    const commit = new Commit(message, tree.id, author, parentIds, committer);
    const commitObject = GitObject.from(commit);

    await objects.add(commitObject);

    return {
      commitId: commitObject.id,
    };
  };

type SnapshotDirectory = {
  type: "directory";
  path: string;
  content: SnapshotEntry[];
};
type SnapshotFile = {
  type: "file";
  path: string;
  content: string;
  mode: number;
};
type SnapshotEntry = SnapshotFile | SnapshotDirectory;
type Snapshot = Map<string, SnapshotEntry>;

const snapshotFromEntries = (indexEntries: IndexEntry[]): Snapshot => {
  const snapshot: Snapshot = new Map();

  const makeRecursivelyDir = (path: string): SnapshotDirectory => {
    const found = snapshot.get(path);

    if (found && found.type === "directory") return found;

    const entry: SnapshotDirectory = {
      type: "directory",
      content: [],
      path,
    };

    if (path === ".") {
      snapshot.set(path, entry);
      return entry;
    }

    makeRecursivelyDir(nodePath.dirname(path)).content.push(entry);

    return entry;
  };

  for (const indexEntry of indexEntries) {
    const snapshotEntry: SnapshotFile = {
      type: "file",
      path: indexEntry.file.path,
      content: indexEntry.objectId,
      mode: indexEntry.file.mode,
    };
    snapshot.set(indexEntry.file.path, snapshotEntry);

    makeRecursivelyDir(nodePath.dirname(indexEntry.file.path)).content.push(
      snapshotEntry
    );
  }

  return snapshot;
};

const createTreeObject = async (
  objects: ObjectStore,
  snapshotEntry: SnapshotDirectory
): Promise<GitObject | null> => {
  const treeEntries = await Promise.all(
    snapshotEntry.content.map(async (snapshotEntry) => {
      if (snapshotEntry.type === "file") {
        return new TreeEntry(
          snapshotEntry.mode.toString(8),
          nodePath.basename(snapshotEntry.path),
          snapshotEntry.content
        );
      }

      const tree = await createTreeObject(objects, snapshotEntry);

      return new TreeEntry(
        "040000",
        nodePath.basename(snapshotEntry.path),
        tree.id
      );
    })
  );
  const tree = new Tree(treeEntries);
  const object = GitObject.from(tree);
  await objects.add(object);
  return object;
};
