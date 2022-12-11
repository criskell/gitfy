import {
  RawObject,
  CommitObject,
  BlobObject,
  TreeObject,
  isObjectType,
  ParsedObject,
} from "./object";
import { parseMessage } from "./message";

export const unwrapObject = (wrapped: Buffer): RawObject => {
  const spaceIndex = wrapped.indexOf(0x20);
  const type = wrapped.toString("ascii", 0, spaceIndex);

  if (!isObjectType(type)) return null;

  const nullIndex = wrapped.indexOf(0x00);
  const size = parseInt(wrapped.toString("ascii", spaceIndex + 1, nullIndex));

  if (!Number.isFinite(size)) return null;

  const data = wrapped.subarray(nullIndex + 1, nullIndex + size + 1);

  return {
    type,
    data,
  };
};

export const parseObject = (raw: RawObject): ParsedObject => {
  if (raw.type === "commit") return parseCommit(raw);
  if (raw.type === "blob") return parseBlob(raw);
  if (raw.type === "tree") return parseTree(raw);
};

export const parseBlob = ({ data }: RawObject): BlobObject => {
  return {
    type: "blob",
    data,
  };
};

export const parseCommit = ({ data }: RawObject): CommitObject => {
  const { headers, body } = parseMessage(data.toString());

  if (
    !(headers.has("tree") && headers.has("author") && headers.has("committer"))
  )
    return null;

  return {
    type: "commit",
    data: {
      message: body,
      treeId: headers.get("tree"),
      author: headers.get("author"),
      parentIds: headers.has("parent") ? headers.get("parent").split(" ") : [],
      committer: headers.get("committer"),
      gpgSignature: headers.get("gpgsig"),
    },
  };
};

export const parseTree = ({ data }: RawObject): TreeObject => {
  const entries = [];

  let cursor = 0;

  while (cursor < data.length) {
    const spaceIndex = data.indexOf(" ", cursor);
    const mode = data.subarray(cursor, spaceIndex);
    const nullIndex = data.indexOf("\0", spaceIndex);
    const path = data.subarray(spaceIndex + 1, nullIndex).toString("ascii");

    cursor = nullIndex + 1 + 20;

    const objectId = data.subarray(nullIndex + 1, cursor).toString("hex");

    const entry = {
      mode,
      path,
      objectId,
    };

    entries.push(entry);
  }

  return {
    type: "tree",
    data: entries,
  };
};
