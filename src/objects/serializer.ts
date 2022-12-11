import {
  ParsedObject,
  TreeObject,
  TreeEntry,
  RawObject,
  CommitObject,
  BlobObject,
} from "./object";
import { serializeMessage } from "./message";

export const wrapObject = ({ type, data }: RawObject): Buffer => {
  const size = data.length;
  const header = Buffer.from(`${type} ${size}\0`, "ascii");

  return Buffer.concat([header, data]);
};

export const serializeObject = (object: ParsedObject): RawObject => {
  if (object.type === "commit")
    return {
      type: "commit",
      data: serializeCommit(object),
    };
  if (object.type === "tree")
    return {
      type: "tree",
      data: serializeTree(object),
    };
  if (object.type === "blob")
    return {
      type: "blob",
      data: serializeBlob(object),
    };
};

export const serializeCommit = (commit: CommitObject): Buffer => {
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

  return Buffer.from(serializeMessage(message));
};

export const serializeTreeEntry = (entry: TreeEntry): Buffer => {
  return Buffer.concat([
    Buffer.from(entry.mode + " " + entry.path + "\0"),
    Buffer.from(entry.objectId, "hex"),
  ]);
};

export const serializeTree = (tree: TreeObject): Buffer => {
  return Buffer.concat(tree.data.map((entry) => serializeTreeEntry(entry)));
};

export const serializeBlob = (blob: BlobObject): Buffer => {
  return blob.data;
};
