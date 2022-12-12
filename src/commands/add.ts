import fs from "fs/promises";
import nodePath from "path";

import { Repository } from "../repository";
import { createIndexEntry } from "../staging";
import { listFiles } from "../util/filesystem";

export interface AddCommand {
  path: string;
}

export const add = async (
  repo: Repository,
  command: AddCommand
): Promise<void> => {
  const startPath = nodePath.resolve(repo.path.root, command.path);

  const matchedFiles = (await fs.lstat(startPath)).isDirectory()
    ? await listFiles(startPath)
    : [startPath];

  await Promise.all(matchedFiles.map((path) => addFile(repo, path)));
  await repo.staging.save();
};

const addFile = async (repo: Repository, path: string): Promise<void> => {
  const content = await fs.readFile(path);
  const { id } = await repo.objects.add({
    type: "blob",
    data: content,
  });
  const relativePath = nodePath.relative(repo.path.root, path);
  const indexEntry = await createIndexEntry(repo.path.root, relativePath, id);

  repo.staging.snapshot.add(indexEntry);
};
