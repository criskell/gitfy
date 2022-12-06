import fs from "fs/promises";

import { Index } from "./index";
import { IndexEntry } from "./entry";
import { exists } from "../util/filesystem";

export class IndexStore {
  public static async from(path: string): Promise<IndexStore> {
    if (! await exists(path)) {
      await fs.writeFile(path, "");

      return new IndexStore(path, new Index());
    }

    const index = await fs.readFile(path).then(Index.from);

    return new IndexStore(path, index);
  }

  public constructor(public path: string, public index: Index) {}

  public async reload(): Promise<void> {
    this.index = await fs.readFile(this.path).then(Index.from);
  }

  public async save(): Promise<void> {
    await fs.writeFile(this.path, this.index.serialize());
  }
}