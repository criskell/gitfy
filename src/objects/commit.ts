import { ObjectType } from "./object";
import { Message } from "./message";

export class Commit {
  public readonly type = ObjectType.COMMIT;
  
  public treeId: string;
  public parentIds: string[] = [];
  public author: string;
  public committer: string;
  public gpgSignature?: string;
  public message: string;

  public static from(raw: Buffer): Commit | null {
    const { headers, body } = Message.from(raw.toString());

    if (
      !(
        headers.has("tree") &&
        headers.has("author") &&
        headers.has("committer")
      )
    ) return null;

    const commit = new Commit;

    commit.treeId = headers.get("tree");
    commit.parentIds = headers.has("parent") ? headers.get("parent").split(" ") : [];
    commit.author = headers.get("author");
    commit.committer = headers.get("committer");
    commit.gpgSignature = headers.get("gpgsig");
    commit.message = body;

    return commit;
  }

  public serialize () {
    const headers = new Map();

    headers.set("tree", this.treeId);
    headers.set("author", this.author);
    headers.set("committer", this.committer);

    if (this.parentIds.length) {
      headers.set("parent", this.parentIds.join(" "));
    }

    if (this.gpgSignature) {
      headers.set("gpgsig", this.gpgSignature);
    }

    const message = new Message();

    message.headers = headers;
    message.body = this.message;

    return Buffer.from(message.serialize());
  }
}