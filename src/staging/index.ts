import { IndexEntry } from "./entry";

import { parseIndex } from "./parser";

export class Index {
  public static from(rawIndex: Buffer) {
    return parseIndex(rawIndex);
  }

  public constructor (
    public entries: IndexEntry[],
    public version: number,
    public checksum: string
  ) {
    //
  } 
}