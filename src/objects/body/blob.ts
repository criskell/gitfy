import { ObjectType } from '..';

export class Blob {
  public readonly type = ObjectType.BLOB;
  public content: Buffer;

  public constructor(content: Buffer) {
    this.content = content;
  }

  public static from(rawBody: Buffer): Blob {
    return new this(rawBody);
  }

  public serialize(): Buffer {
    return this.content;
  }
}
