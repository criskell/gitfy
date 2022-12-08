import fs from "fs/promises";
import nodePath from "path";

import { ObjectType, ObjectId } from "../objects";
import { ObjectStore } from "../objects/store";
import { TreeEntry } from "../objects/body/tree";

export interface CheckoutRequest {
  commitId: ObjectId;
  workingTreePath: string;
}

export const mount = async (
  store: ObjectStore,
  entries: TreeEntry[],
  mountPath: string
) => {
  for await (const entry of entries) {
    const objectMountPath = nodePath.join(mountPath, entry.path);
    const object = await store.get(entry.objectId);
    const body = object.body();

    if (body.type === ObjectType.BLOB) {
      await fs.writeFile(objectMountPath, body.content);
    }

    if (body.type === ObjectType.TREE) {
      await fs.mkdir(objectMountPath);
      await mount(store, body.entries, objectMountPath);
    }
  }
};

export const checkout =
  (store: ObjectStore) =>
  async (request: CheckoutRequest): Promise<void> => {
    const commitObject = await store.get(request.commitId);
    const commit = commitObject.body();

    if (commit.type !== ObjectType.COMMIT) return;

    const treeObject = await store.get(commit.treeId);
    const tree = treeObject.body();

    if (tree.type !== ObjectType.TREE) return;

    await fs.mkdir(request.workingTreePath, { recursive: true });

    const rootEntries = tree.entries;

    await mount(store, rootEntries, request.workingTreePath);
  };
