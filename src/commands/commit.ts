import nodePath from "path";

import { IndexEntry, IndexStore } from "../staging";
import {
  GitObject,
  Commit,
  Tree,
  Blob,
  TreeEntry,
  ObjectStore,
} from "../objects";
import { RefStore } from "../refs";

export interface CommitCommand {
  message: string;
  author: string;
}

export interface CommitResult {
  commitId: string;
}

export interface CommitParams extends CommitCommand {
  objectStore: ObjectStore;
  indexStore: IndexStore;
  refStore: RefStore;
}

export const commit = async ({
  objectStore,
  indexStore,
  refStore,
  message,
  author,
}): Promise<CommitResult> => {
  const indexEntries = indexStore.index.entries();

  const snapshot = snapshotFromEntries(indexEntries);
  const snapshotRoot = snapshot.get(".") as SnapshotDirectory;
  const tree = await createTreeObject(objectStore, snapshotRoot);

  const committer = author;
  const head = await refStore.resolve("HEAD");
  const parentIds = head ? [head] : [];

  const commit = new Commit(message, tree.id, author, parentIds, committer);
  const commitObject = GitObject.from(commit);

  await objectStore.add(commitObject);

  await refStore.set(
    (
      await refStore.getDirectRef("HEAD")
    ).name,
    commitObject.id
  );

  return {
    commitId: commitObject.id,
  };
};

type SnapshotDirectory = {
  type: "directory";
  path: string;
  mode: number;
  children: SnapshotEntry[];
};

type SnapshotFile = {
  type: "file";
  objectId: string;
  path: string;
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
      children: [],
      path,
      mode: 0o040000,
    };

    if (path === ".") {
      snapshot.set(path, entry);
      return entry;
    }

    makeRecursivelyDir(nodePath.dirname(path)).children.push(entry);

    return entry;
  };

  for (const indexEntry of indexEntries) {
    const snapshotEntry: SnapshotFile = {
      path: indexEntry.file.path,
      mode: indexEntry.file.mode,
      type: "file",
      objectId: indexEntry.objectId,
    };

    snapshot.set(indexEntry.file.path, snapshotEntry);

    makeRecursivelyDir(nodePath.dirname(indexEntry.file.path)).children.push(
      snapshotEntry
    );
  }

  return snapshot;
};

const createTreeObject = async (
  objects: ObjectStore,
  snapshotEntry: SnapshotDirectory
): Promise<GitObject> => {
  const treeEntries = await Promise.all(
    snapshotEntry.children.map(async (snapshotEntry) => {
      const objectId =
        snapshotEntry.type === "file"
          ? snapshotEntry.objectId
          : (await createTreeObject(objects, snapshotEntry)).id;

      return new TreeEntry(
        snapshotEntry.mode.toString(8),
        nodePath.basename(snapshotEntry.path),
        objectId
      );
    })
  );

  const tree = new Tree(treeEntries);
  const object = GitObject.from(tree);

  await objects.add(object);

  return object;
};
