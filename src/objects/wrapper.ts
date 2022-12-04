import { ObjectType, isObjectType } from "./object";

export class Wrapper {
  public type: ObjectType;
  public body: Buffer;

  public static from(raw: Buffer): Wrapper {
    const spaceIndex = raw.indexOf(0x20);
    const type = raw.toString("ascii", 0, spaceIndex);

    if (!isObjectType(type)) return null;

    const nullIndex = raw.indexOf(0x00);
    const size = parseInt(raw.toString("ascii", spaceIndex + 1, nullIndex));

    if (!Number.isFinite(size)) return null;

    const body = raw.subarray(nullIndex + 1, nullIndex + size + 1);

    const wrapper = new Wrapper();

    wrapper.type = type;
    wrapper.body = body;

    return wrapper;
  }

  public serialize() {
    const size = this.body.length;
    const header = Buffer.from(`${this.type} ${size}\0`, "ascii");

    return Buffer.concat([header, this.body]);
  }
}
