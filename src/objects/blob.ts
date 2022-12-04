import { ObjectType } from "./object";

export class Blob {
  public readonly type = ObjectType.BLOB;
  public content: Buffer;

  public static from(raw: Buffer): Blob {
    const blob = new Blob();
    
    blob.content = raw;
    
    return blob;
  }

  public serialize(): Buffer {
    return this.content;
  }
}