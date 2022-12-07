import { IndexEntry } from './entry';
import { sha1 } from '../util/hash';

export const serializeHeader = (
  version: number,
  numberOfEntries: number
): Buffer => {
  const header = Buffer.alloc(12);

  header.write('DIRC');
  header.writeUInt32BE(version, 4);
  header.writeUInt32BE(numberOfEntries, 8);

  return header;
};

export const serializeFlags = (flags: {
  assumeValid: boolean;
  extendedFlag: boolean;
  stage: number;
  pathLength: number;
}): number => {
  return (
    ((1 << 15) & (Number(flags.assumeValid) << 15)) |
    (Number(flags.extendedFlag) << 14) |
    (flags.stage << 12) |
    flags.pathLength
  );
};

export const serializeEntry = (entry: IndexEntry): Buffer => {
  const entryLength = 62 + entry.file.path.length;
  const paddingLength = 8 - (entryLength % 8);
  const totalLength = entryLength + paddingLength;

  const buf = Buffer.alloc(totalLength);

  const flags = serializeFlags({
    assumeValid: entry.flags.assumeValid,
    extendedFlag: entry.flags.extendedFlag,
    pathLength: entry.file.path.length,
    stage: entry.stage,
  });

  buf.writeUInt32BE(entry.timestamps.metadataChanged[0], 0);
  buf.writeUInt32BE(entry.timestamps.metadataChanged[1], 4);
  buf.writeUInt32BE(entry.timestamps.dataChanged[0], 8);
  buf.writeUInt32BE(entry.timestamps.dataChanged[1], 12);
  buf.writeUInt32BE(entry.file.device, 16);
  buf.writeUInt32BE(entry.file.inodeNumber, 20);
  buf.writeUInt32BE(entry.file.mode, 24);
  buf.writeUInt32BE(entry.userId, 28);
  buf.writeUInt32BE(entry.groupId, 32);
  buf.writeUInt32BE(entry.file.size, 36);
  buf.write(entry.objectId, 40, 20, 'hex');
  buf.writeUInt16BE(flags, 60);
  buf.write(entry.file.path, 62);

  return buf;
};

export const serializeIndex = (index: {
  version: number;
  entries: IndexEntry[];
  rawExtensions?: Buffer;
}): Buffer => {
  const header = serializeHeader(index.version, index.entries.length);
  const entries = Buffer.concat(index.entries.map(serializeEntry));

  const content = Buffer.concat(
    index.rawExtensions
      ? [header, entries, index.rawExtensions]
      : [header, entries]
  );
  const checksum = Buffer.from(sha1(content), 'hex');

  return Buffer.concat([content, checksum]);
};
