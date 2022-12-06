import { IndexEntry } from "./entry";

import { parseIndex } from "./parser";
import { serializeIndex } from "./serializer";

export * from "./entry";
export { IndexStore } from "./store";

export class Index {
  public static from(rawIndex: Buffer) {
    const { entries, rawExtensions } = parseIndex(rawIndex);

    return new Index(entries, rawExtensions);
  }

  public constructor(private unsortedEntries: IndexEntry[] = [], public rawExtensions?: Buffer) {
    //
  }

  public add(entry: IndexEntry) {
    this.unsortedEntries.push(entry);
  }

  public entries() {
    return this.unsortedEntries.sort((a, b) => Number(a.file.path > b.file.path) - Number(a.file.path < b.file.path));
  }

  public serialize(): Buffer {
    return serializeIndex({
      version: 2,
      entries: this.entries(),
      rawExtensions: this.rawExtensions,
    });
  }
}