import { add, AddCommand } from '../commands/add';
import { commit, CommitCommand } from '../commands/commit';
import { PathBuilder } from "./path";
import { Config } from "./config";
import { ObjectStore } from "../objects";
import { IndexStore } from "../staging";

export class Repository {
  constructor(
    public path: PathBuilder,
    public config: Config,
    public objectStore: ObjectStore,
    public indexStore: IndexStore
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
      indexStore: this.indexStore,
      objectStore: this.objectStore,
    });
  }
}
