import nodePath from "path";

import { Repository } from "../repository";
import { IndexEntry } from "../staging";
import { ObjectStore } from "../objects";

export interface CommitCommand {
  message: string;
  author: string;
  committer?: string;
}

export interface CommitResult {
  commitId: string;
}

export const commit = async (
  repo: Repository,
  command: CommitCommand
): Promise<CommitResult> => {
  const indexEntries = repo.staging.snapshot.entries();

  const snapshot = snapshotFromEntries(indexEntries);
  const snapshotRoot = snapshot.get(".") as SnapshotDirectory;
  const treeId = await createTreeObject(repo.objects, snapshotRoot);

  const message = command.message;
  const author = command.author;
  const committer = command.committer || command.author;

  const currentHead = await repo.refs.resolve("HEAD");

  const headCommitId = currentHead?.value;
  const parentIds = headCommitId ? [headCommitId] : [];

  const insert = await repo.objects.add({
    type: "commit",
    data: {
      message,
      treeId: treeId,
      author,
      parentIds,
      committer,
    },
  });

  currentHead.value = insert.id;

  await repo.refs.save(currentHead);

  return {
    commitId: insert.id,
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
): Promise<string> => {
  const treeEntries = await Promise.all(
    snapshotEntry.children.map(async (snapshotEntry) => {
      const objectId =
        snapshotEntry.type === "file"
          ? snapshotEntry.objectId
          : await createTreeObject(objects, snapshotEntry);

      return {
        mode: snapshotEntry.mode,
        path: nodePath.basename(snapshotEntry.path),
        objectId,
      };
    })
  );

  return (
    await objects.add({
      type: "tree",
      data: treeEntries,
    })
  ).id;
};
