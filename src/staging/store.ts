import fs from "fs/promises";

import { Index } from "./index";
import { exists } from "../util/filesystem";

export class IndexStore {
  public static async from(path: string): Promise<IndexStore> {
    if (!(await exists(path))) {
      return new IndexStore(path, new Index());
    }

    const index = await fs.readFile(path).then(Index.from);

    return new IndexStore(path, index);
  }

  public constructor(public path: string, public snapshot: Index) {}

  public async reload(): Promise<void> {
    this.snapshot = await fs.readFile(this.path).then(Index.from);
  }

  public async save(): Promise<void> {
    await fs.writeFile(this.path, this.snapshot.serialize());
  }
}
