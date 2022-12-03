import fs from "fs/promises";

import {
  GitObject,
  ObjectId,
  generateObjectId,
  deserializeObject,
  serializeObject
} from "./object";
import {
  Wrapper,
  serialize as serializeWrapper,
  deserialize as deserializeWrapper
} from "./wrapper";
import { compress, decompress } from "../util/compression";

export class ObjectStore {
  constructor (public path: string) {}

  public async get(id: ObjectId): Promise<any> {
    const serializedWrapper = await this.readRaw(id);

    if (! serializedWrapper) return null;

    return deserializeObject(deserializeWrapper(serializedWrapper));
  }

  public async add (object: GitObject): Promise<string> {
    const wrapped = serializeWrapper(serializeObject(object));
    const objectId = generateObjectId(wrapped);

    await this.writeRaw(objectId, wrapped);

    return objectId;
  }

  public async writeRaw (objectId: ObjectId, raw: Buffer) {
    const directory = `${this.path}/${objectId.slice(0, 2)}`;
    const savePath = `${directory}/${objectId.slice(2)}`;
    const compressed = await compress(raw);

    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(savePath, compressed);
  }

  public async readRaw (objectId: ObjectId): Promise<Buffer | null> {
    const objectPath = `${this.path}/${objectId.slice(0, 2)}/${objectId.slice(2)}`;

    try {
      const compressed = await fs.readFile(objectPath);
      const raw = await decompress(compressed);

      return raw;
    } catch (e) {
      if (e.code === "ENOTENT") return null;
      throw e;
    }
  }
}