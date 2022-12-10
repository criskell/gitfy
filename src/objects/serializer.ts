import { GitObject, Tree, TreeEntry, RawObject, Commit, Blob } from "./object";
import { serializeMessage } from "./message";

export const wrapObject = ({ type, raw }: RawObject): Buffer => {
  const size = raw.length;
  const header = Buffer.from(`${type} ${size}\0`, "ascii");

  return Buffer.concat([header, raw]);
};

export const serializeObject = (object: GitObject) => {
  if (object.type === "commit") return serializeCommit(object);
  if (object.type === "blob") return serializeBlob(object);
  if (object.type === "tree") return serializeTree(object);
};

export const serializeBlob = (blob: Blob): RawObject => {
  return {
    type: "blob",
    raw: blob.content,
  };
};

export const serializeCommit = (commit: Commit): RawObject => {
  const headers = new Map();

  headers.set("tree", commit.treeId);
  headers.set("author", commit.author);
  headers.set("committer", commit.committer);

  if (commit.parentIds.length) {
    headers.set("parent", commit.parentIds.join(" "));
  }

  if (commit.gpgSignature) {
    headers.set("gpgsig", commit.gpgSignature);
  }

  const message = {
    headers,
    body: commit.message,
  };

  return {
    type: "commit",
    raw: Buffer.from(serializeMessage(message)),
  };
};

export const serializeTreeEntry = (entry: TreeEntry): Buffer => {
  return Buffer.concat([
    Buffer.from(entry.mode + " " + entry.path + "\0"),
    Buffer.from(entry.objectId, "hex"),
  ]);
};

export const serializeTree = (tree: Tree): RawObject => {
  return {
    type: "tree",
    raw: Buffer.concat(tree.entries.map((entry) => serializeTreeEntry(entry))),
  };
};
