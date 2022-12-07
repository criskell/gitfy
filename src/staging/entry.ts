import fs from "fs/promises";
import nodePath from "path";

type IndexEntryProps = { [prop in keyof IndexEntry]: IndexEntry[prop] };

export const createIndexEntry = async (rootDirectory: string, relativePath: string, objectId: string): Promise<IndexEntry> => {
  const stats = await fs.lstat(nodePath.join(rootDirectory, relativePath), { bigint: true });

  const entry: IndexEntryProps = {
    objectId,
    file: {
      mode: Number(stats.mode),
      path: relativePath,
      size: Number(stats.size),
      inodeNumber: Number(stats.ino),
      device: Number(stats.dev),
    },
    timestamps: {
      metadataChanged: [Number(stats.ctimeMs) % 2 ** 32, Number(stats.ctimeNs) % 2 ** 32],
      dataChanged: [Number(stats.mtimeMs) % 2 ** 32, Number(stats.mtimeNs) % 2 ** 32],
    },
    flags: {
      assumeValid: false,
      extendedFlag: false,
    },
    stage: 0,
    groupId: Number(stats.gid),
    userId: Number(stats.uid),
  };

  return new IndexEntry(entry);
};

export class IndexEntry {
  public objectId: string;

  public file: {
    mode: number,
    path: string, // Relativo ao diretório de nível superior
    size: number,
    inodeNumber: number,
    device: number,
  };

  public timestamps: {
    metadataChanged: [seconds: number, nanoseconds: number],
    dataChanged: [seconds: number, nanoseconds: number],
  };

  public flags: {
    assumeValid: boolean,
    extendedFlag: boolean
  };

  public stage: number;

  public userId: number;
  public groupId: number;

  constructor({ objectId, file, timestamps, userId, groupId, stage, flags }: IndexEntryProps) {
    this.objectId = objectId;
    this.file = file;
    this.timestamps = timestamps;
    this.userId = userId;
    this.groupId = groupId;
    this.stage = stage;
    this.flags = flags;
  }
}