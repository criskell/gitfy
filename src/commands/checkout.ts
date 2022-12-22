import fs from "fs/promises";
import nodePath from "path";

import { Repository } from "../repository";
import { ObjectStore, TreeEntry } from "../objects";

export interface CheckoutCommand {
  commitId: string;
  workingTreePath: string;
}

export const checkout = (repo: Repository) => async (command: CheckoutCommand): Promise<void> => {
  const commit = await repo.objects.findOne({
    type: "commit",
    id: command.commitId,
  });

  if (!commit) return;

  const tree = await repo.objects.findOne({
    type: "tree",
    id: commit.data.treeId,
  });

  if (!tree) return;

  await fs.mkdir(command.workingTreePath, { recursive: true });

  const entries = tree.data;
  await mount(repo.objects, entries, command.workingTreePath);
};

const mount = async (
  objects: ObjectStore,
  entries: TreeEntry[],
  mountPath: string
) => {
  for await (const entry of entries) {
    const objectMountPath = nodePath.join(mountPath, entry.path);
    const object = await objects.findOne({ id: entry.objectId });

    if (object.type === "blob") {
      await fs.writeFile(objectMountPath, object.data);
    }

    if (object.type === "tree") {
      await fs.mkdir(objectMountPath);
      await mount(objects, object.data, objectMountPath);
    }
  }
};
