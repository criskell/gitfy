import { ObjectType } from "./object";

import {
  serialize as serializeMessage,
  deserialize as deserializeMessage,
} from "./message";

export interface Commit {
  type: ObjectType.COMMIT;
  treeId: string;
  parentIds: string[];
  author: string;
  committer: string;
  gpgSignature?: string;
  message: string;
}

export const serialize = (commit: Commit): Buffer => {
  const headers = new Map([
    ["tree", commit.treeId],
    ["author", commit.author],
    ["committer", commit.committer],
  ]);

  if (commit.parentIds.length) {
    headers.set("parent", commit.parentIds.join(" "));
  }

  if (commit.gpgSignature) {
    headers.set("gpgsig", commit.gpgSignature);
  }

  return Buffer.from(
    serializeMessage({
      headers,
      body: commit.message,
    })
  );
};

export const deserialize = (raw: Buffer): Commit | null => {
  const { headers, body } = deserializeMessage(raw.toString());

  if (
    !(
      headers.has("tree") &&
      headers.has("author") &&
      headers.has("committer")
    )
  )
    return null;

  return {
    type: ObjectType.COMMIT,
    treeId: headers.get("tree"),
    parentIds: (headers.get("parent") || "").split(" ").filter((x) => x),
    author: headers.get("author"),
    committer: headers.get("committer"),
    gpgSignature: headers.get("gpgsig"),
    message: body,
  };
};
