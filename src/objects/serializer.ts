import {
  ParsedObject,
  TreeObject,
  TreeEntry,
  RawObject,
  CommitObject,
  BlobObject,
  GitObject,
} from "./object";
import { serializeMessage } from "./message";

export const wrapObject = ({ type, data }: RawObject): Buffer => {
  const size = data.length;
  const header = Buffer.from(`${type} ${size}\0`, "ascii");

  return Buffer.concat([header, data]);
};

export const serializeObject = (object: GitObject): RawObject => {
  if (Buffer.isBuffer(object.data)) {
    const x = object.data;
  }
  if (object.type === "commit") return serializeCommit(object);
  if (object.type === "blob") return serializeBlob(object);
  if (object.type === "tree") return serializeTree(object);
};

export const serializeBlob = ({ data }: BlobObject): RawObject => {
  return {
    type: "blob",
    data,
  };
};

export const serializeCommit = (commit: CommitObject): RawObject => {
  const headers = new Map();

  headers.set("tree", commit.data.treeId);
  headers.set("author", commit.data.author);
  headers.set("committer", commit.data.committer);

  if (commit.data.parentIds.length) {
    headers.set("parent", commit.data.parentIds.join(" "));
  }

  if (commit.data.gpgSignature) {
    headers.set("gpgsig", commit.data.gpgSignature);
  }

  const message = {
    headers,
    body: commit.data.message,
  };

  return {
    type: "commit",
    data: Buffer.from(serializeMessage(message)),
  };
};

export const serializeTreeEntry = (entry: TreeEntry): Buffer => {
  return Buffer.concat([
    Buffer.from(entry.mode + " " + entry.path + "\0"),
    Buffer.from(entry.objectId, "hex"),
  ]);
};

export const serializeTree = (tree: TreeObject): RawObject => {
  return {
    type: "tree",
    data: Buffer.concat(tree.data.map((entry) => serializeTreeEntry(entry))),
  };
};
