import { ObjectType } from "..";
import { Commit } from "./commit";
import { Blob } from "./blob";
import { Tree } from "./tree";
import { Wrapper } from "../wrapper";

export type ObjectBody = Commit | Blob | Tree;

export const isBlob = (body: ObjectBody): body is Blob =>
  body.type === ObjectType.BLOB;

export const isCommit = (body: ObjectBody): body is Commit =>
  body.type === ObjectType.COMMIT;

export const isTree = (body: ObjectBody): body is Tree =>
  body.type === ObjectType.TREE;

export class BodySerializer {
  public static serialize(body: ObjectBody): Buffer {
    if (isBlob(body) || isCommit(body) || isTree(body)) return body.serialize();
  }

  public static deserializeFromWrapper(wrapper: Wrapper): ObjectBody {
    return {
      [ObjectType.BLOB]: Blob,
      [ObjectType.COMMIT]: Commit,
      [ObjectType.TREE]: Tree,
    }[wrapper.type].from(wrapper.body);
  }
}
