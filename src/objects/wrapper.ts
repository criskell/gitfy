import { ObjectType, isValidType } from "./object";

export interface Wrapper {
  type: ObjectType;
  body: Buffer;
}

export const serialize = ({ type, body }: Wrapper): Buffer => {
  const size = body.length;
  const header = Buffer.from(`${type} ${size}\0`, "ascii");

  return Buffer.concat([header, body]);
}

export const deserialize = (serializedWrapper: Buffer): Wrapper => {
  const spaceIndex = serializedWrapper.indexOf(0x20);
  const type = serializedWrapper.toString("ascii", 0, spaceIndex);

  if (! isValidType(type)) return null;

  const nullIndex = serializedWrapper.indexOf(0x00);
  const size = parseInt(serializedWrapper.toString("ascii", spaceIndex + 1, nullIndex));

  if (! Number.isFinite(size)) return null;

  const body = serializedWrapper.subarray(nullIndex + 1, nullIndex + size + 1);

  return {
    type: type as ObjectType,
    body,
  };
};