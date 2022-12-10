import fs from "fs/promises";
import nodePath from "path";

import { Repository } from "../repository";
import { ObjectStore, TreeEntry } from "../objects";

export interface CheckoutCommand {
  commitId: string;
  workingTreePath: string;
}

export const checkout = async (repo: Repository, command: CheckoutCommand): Promise<void> => {
  const commitObject = await repo.objectStore.get(command.commitId);

  if (commitObject.type !== "commit") return;

  const treeObject = await repo.objectStore.get(commitObject.treeId);

  if (treeObject.type !== "tree") return;

  await fs.mkdir(command.workingTreePath, { recursive: true });

  const rootEntries = treeObject.entries;
  await mount(repo.objectStore, rootEntries, command.workingTreePath);
};

const mount = async (
  store: ObjectStore,
  entries: TreeEntry[],
  mountPath: string
) => {
  for await (const entry of entries) {
    const objectMountPath = nodePath.join(mountPath, entry.path);
    const object = await store.get(entry.objectId);

    if (object.type === "blob") {
      await fs.writeFile(objectMountPath, object.content);
    }

    if (object.type === "tree") {
      await fs.mkdir(objectMountPath);
      await mount(store, object.entries, objectMountPath);
    }
  }
};