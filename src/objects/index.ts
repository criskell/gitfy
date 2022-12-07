import { ObjectBody, BodySerializer } from './body';
import { Wrapper } from './wrapper';
import { sha1 } from '../util/hash';

export * from './body';
export { ObjectStore } from './store';

export type ObjectId = string;
export enum ObjectType {
  BLOB = 'blob',
  COMMIT = 'commit',
  TREE = 'tree',
}

export class GitObject {
  public static from(content: Buffer): GitObject;
  public static from(wrapper: Wrapper): GitObject;
  public static from(body: ObjectBody): GitObject;
  public static from(data: Buffer | Wrapper | ObjectBody): GitObject {
    if (data instanceof Buffer) {
      return new GitObject(data, generateObjectId(data));
    }

    if (data instanceof Wrapper) {
      return this.from(data.serialize());
    }

    return this.from(new Wrapper(data.type, data.serialize()).serialize());
  }

  public constructor(
    public readonly content: Buffer,
    public readonly id: ObjectId
  ) {
    //
  }

  public wrapper() {
    return Wrapper.from(this.content);
  }

  public body() {
    return BodySerializer.deserializeFromWrapper(this.wrapper());
  }
}

export const isObjectType = (type: string): type is ObjectType =>
  Object.values<string>(ObjectType).indexOf(type) !== -1;

export const generateObjectId = sha1;
