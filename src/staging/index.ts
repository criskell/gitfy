import { IndexEntry } from "./entry";

import { parseIndex } from "./parser";
import { serializeIndex } from "./serializer";

export class Index {
  public static from(rawIndex: Buffer) {
    const { entries, rawExtensions } = parseIndex(rawIndex);

    return new Index(entries, rawExtensions);
  }

  public constructor(private unsortedEntries: IndexEntry[], public rawExtensions?: Buffer) {
    //
  }

  public entries() {
    return this.unsortedEntries.sort((a, b) => (a.path > b.path) - (a.path < b.path));
  }

  public serialize(): Buffer {
    return serializeIndex({
      version: 2,
      entries: this.entries(),
      rawExtensions: this.rawExtensions,
    });
  }
}