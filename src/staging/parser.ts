import { IndexEntry } from "./entry";
import { Index } from ".";

export interface Header {
  signature: Buffer;
  version: number;
  numberOfEntries: number;
}

export const parseHeader = (raw: Buffer): Header => {
  const signature = raw.subarray(0, 4);
  const version = raw.readUInt32BE(4);
  const numberOfEntries = raw.readUInt32BE(8);

  return {
    signature,
    version,
    numberOfEntries,
  };
};

export const parseFlags = (rawFlags) => {
  return {
    assumeValid: Boolean(rawFlags >>> 15),
    extendedFlag: Boolean(rawFlags >>> 14 & 1),
    stage: rawFlags >>> 12 & 0b0011,
    pathLength: rawFlags & 0b0000000111111111,
  };
};

export const parseEntries = (data: Buffer, numberOfEntries: number): [entries: IndexEntry[], rawEntriesLength: number] => {
  const entries: IndexEntry[] = [];

  let cursor = 0;

  while (cursor + 62 < data.length) {
    const ctimeInSeconds = data.readUInt32BE(cursor);
    const ctimeInNanoseconds = data.readUInt32BE(cursor + 4);
    const mtimeInSeconds = data.readUInt32BE(cursor + 8);
    const mtimeInNanoseconds = data.readUInt32BE(cursor + 12);
    const dev = data.readUInt32BE(cursor + 16);
    const ino = data.readUInt32BE(cursor + 20);
    const mode = data.readUInt32BE(cursor + 24);
    const uid = data.readUInt32BE(cursor + 28);
    const gid = data.readUInt32BE(cursor + 32);
    const size = data.readUInt32BE(cursor + 36);
    const objectId = data.subarray(cursor + 40, cursor + 60).toString("hex");
    const rawFlags = data.readUInt16BE(cursor + 60);
    const flags = parseFlags(rawFlags);
    const path = data.subarray(cursor + 62, cursor + 62 + flags.pathLength).toString();
    
    entries.push({
      objectId,

      file: {
        mode,
        path,
        size,
        inodeNumber: ino,
        device: dev,
      },

      timestamps: {
        metadataChanged: [ctimeInSeconds, ctimeInNanoseconds],
        dataChanged: [mtimeInSeconds, mtimeInNanoseconds],
      },

      flags: {
        assumeValid: flags.assumeValid,
        extendedFlag: flags.extendedFlag,
      },

      stage: flags.stage,

      userId: uid,
      groupId: gid,
    });

    const entryLength = 62 + flags.pathLength;
    const paddingLength = 8 - entryLength % 8;
    const totalLength = entryLength + paddingLength;

    cursor += totalLength;
  }

  return [entries, cursor];
};

export const parseIndex = (rawIndex: Buffer): Index => {
  const header = parseHeader(rawIndex.subarray(0, 12));
  const [entries, rawEntriesLength] = parseEntries(rawIndex.subarray(12, -20), header.numberOfEntries);
  const checksum = rawIndex.subarray(-20).toString("hex");
  const rawExtensions = rawIndex.subarray(12 + rawEntriesLength, -20);

  return new Index(entries, header.version, checksum, rawExtensions);
};
