import nodePath from "path";

import { PathBuilder } from "./path";
import { Config } from "./config";
import { ObjectStore } from "../objects";
import { IndexStore } from "../staging";
import { findGitDirectory } from "../util/repository";
import { RefStore } from "../refs";
import { makeCommandRegistry } from "../commands";

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
  const objectStore = new ObjectStore(pathBuilder);
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
    public objects: ObjectStore,
    public staging: IndexStore,
    public refs: RefStore
  ) {}

  commands = makeCommandRegistry(this);
}
