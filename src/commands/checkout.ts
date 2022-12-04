import fs from "fs/promises";
import nodePath from "path";

import { ObjectType, ObjectId } from "../objects/object";
import { ObjectStore } from "../objects/store";
import { TreeEntry } from "../objects/tree";

export interface CheckoutRequest {
  commitId: ObjectId;
  workingTreePath: string;
}

export const mount = async (store: ObjectStore, entries: TreeEntry[], mountPath: string) => {
  for await (const entry of entries) {
    const objectMountPath = nodePath.join(mountPath, entry.path);
    const object = await store.get(entry.objectId);

    if (object.type === ObjectType.BLOB) {
      await fs.writeFile(objectMountPath, object.content);
    }

    if (object.type === ObjectType.TREE) {
      await fs.mkdir(objectMountPath);
      await mount(store, object.entries, objectMountPath);
    }
  }
};

export const checkout = (store: ObjectStore) =>
  async (request: CheckoutRequest): Promise<void> => {
  const commit = await store.get(request.commitId);

  if (commit.type !== ObjectType.COMMIT) return;

  const tree = await store.get(commit.treeId);

  if (!tree || tree.type !== ObjectType.TREE) return;

  await fs.mkdir(request.workingTreePath, { recursive: true });

  const rootEntries = tree.entries;

  await mount(store, rootEntries, request.workingTreePath);
};