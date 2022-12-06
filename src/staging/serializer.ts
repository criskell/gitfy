import { IndexEntry } from "./entry";
import { Index } from ".";
import { sha1 } from "../util/hash";

export const serializeHeader = (index: Index): Buffer => {
  const header = Buffer.alloc(12);
  
  header.write("DIRC");
  header.writeUInt32BE(index.version, 4);
  header.writeUInt32BE(index.entries.length, 8);

  return header;
};

export const serializeFlags = (entry: IndexEntry): number => {
  return (
    (1 << 15)
    & (Number(entry.flags.assumeValid) << 15)
    | (Number(entry.flags.extendedFlag) << 14)
    | (entry.stage << 12)
    | entry.file.path.length
  );
}; 

export const serializeEntry = (entry: IndexEntry): Buffer => {
  const entryLength = 62 + entry.file.path.length;
  const paddingLength = 8 - entryLength % 8;
  const totalLength = entryLength + paddingLength;

  const buf = Buffer.alloc(totalLength);
  
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
  buf.write(entry.objectId, 40, 20, "hex");
  buf.writeUInt16BE(serializeFlags(entry), 60);
  buf.write(entry.file.path, 62);
  buf.fill(0, entryLength, totalLength);

  return buf;
};

export const serializeIndex = (index: Index): Buffer => {
  const header = serializeHeader(index);
  const entries = Buffer.concat(index.entries.map(serializeEntry));

  const content = Buffer.concat([header, entries]);
  const checksum = Buffer.from(sha1(content), "hex");

  return Buffer.concat([content, checksum]);
};