import {
  RawObject,
  Commit,
  GitObject,
  Blob,
  Tree,
  TreeEntry,
  isObjectType,
} from "./object";
import { parseMessage } from "./message";

export const unwrapObject = (wrapped: Buffer): RawObject => {
  const spaceIndex = wrapped.indexOf(0x20);
  const type = wrapped.toString("ascii", 0, spaceIndex);

  if (!isObjectType(type)) return null;

  const nullIndex = wrapped.indexOf(0x00);
  const size = parseInt(wrapped.toString("ascii", spaceIndex + 1, nullIndex));

  if (!Number.isFinite(size)) return null;

  const raw = wrapped.subarray(nullIndex + 1, nullIndex + size + 1);

  return {
    type,
    raw,
  };
};

export const parseObject = (raw: RawObject): GitObject => {
  if (raw.type === "commit") return parseCommit(raw);
  if (raw.type === "blob") return parseBlob(raw);
  if (raw.type === "tree") return parseTree(raw);
};

export const parseBlob = ({ raw }: RawObject): Blob => {
  return {
    type: "blob",
    content: raw,
  };
};

export const parseCommit = ({ raw }: RawObject): Commit => {
  const { headers, body } = parseMessage(raw.toString());

  if (
    !(headers.has("tree") && headers.has("author") && headers.has("committer"))
  )
    return null;

  return {
    type: "commit",
    message: body,
    treeId: headers.get("tree"),
    author: headers.get("author"),
    parentIds: headers.has("parent") ? headers.get("parent").split(" ") : [],
    committer: headers.get("committer"),
    gpgSignature: headers.get("gpgsig"),
  };
};

export const parseTree = ({ raw }: RawObject): Tree => {
  const entries = [];

  let cursor = 0;

  while (cursor < raw.length) {
    const spaceIndex = raw.indexOf(" ", cursor);
    const mode = raw.subarray(cursor, spaceIndex);
    const nullIndex = raw.indexOf("\0", spaceIndex);
    const path = raw.subarray(spaceIndex + 1, nullIndex).toString("ascii");

    cursor = nullIndex + 1 + 20;

    const objectId = raw.subarray(nullIndex + 1, cursor).toString("hex");

    const entry = {
      mode,
      path,
      objectId,
    };

    entries.push(entry);
  }

  return {
    type: "tree",
    entries,
  };
};
