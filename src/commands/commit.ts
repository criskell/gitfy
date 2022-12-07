import nodePath from 'path';

import { ObjectStore } from '../objects/store';
import { IndexEntry, IndexStore } from '../staging';
import { GitObject, Commit, Tree, Blob } from '../objects';
import { TreeEntry } from '../objects/body/tree';

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
    const snapshotRoot = snapshot.get('.') as SnapshotDirectory;
    const tree = await createTreeObject(objects, snapshotRoot);

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
  type: 'directory';
  path: string;
  mode: number;
  children: SnapshotEntry[];
};
type SnapshotFile = {
  type: 'file';
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

    if (found && found.type === 'directory') return found;

    const entry: SnapshotDirectory = {
      type: 'directory',
      children: [],
      path,
      mode: 0o040000,
    };

    if (path === '.') {
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
      type: 'file',
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
        snapshotEntry.type === 'file'
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
