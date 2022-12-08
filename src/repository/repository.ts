import nodePath from "path";

import { add, AddCommand } from "../commands/add";
import { commit, CommitCommand } from "../commands/commit";
import { PathBuilder } from "./path";
import { Config } from "./config";
import { ObjectStore } from "../objects";
import { IndexStore } from "../staging";
import { findGitDirectory } from "../util/repository";
import { RefStore } from "../refs";

export const loadRepository = async (
  path?: string
): Promise<Repository | null> => {
  const gitDirectory = await findGitDirectory(path || process.cwd());

  if (!gitDirectory) return null;

  const config = await Config.load(nodePath.join(gitDirectory, "config"));
  const pathBuilder = new PathBuilder(
    !config.data.core.bare ? nodePath.dirname(gitDirectory) : gitDirectory,
    config.data.core.bare
  );
  const objectStore = new ObjectStore(pathBuilder.objects);
  const indexStore = await IndexStore.from(pathBuilder.index);
  const refStore = new RefStore(pathBuilder.git);
  const repo = new Repository(
    pathBuilder,
    config,
    objectStore,
    indexStore,
    refStore
  );

  return repo;
};

export class Repository {
  constructor(
    public path: PathBuilder,
    public config: Config,
    public objectStore: ObjectStore,
    public indexStore: IndexStore,
    public refStore: RefStore
  ) {}

  public add(command: AddCommand) {
    return add({
      ...command,
      rootDirectory: this.path.root,
      indexStore: this.indexStore,
      objectStore: this.objectStore,
    });
  }

  public commit(command: CommitCommand) {
    return commit({
      ...command,
      refStore: this.refStore,
      indexStore: this.indexStore,
      objectStore: this.objectStore,
    });
  }
}
