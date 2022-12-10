import fs from "fs/promises";

import { PathBuilder } from "../repository/path";
import { GitObject, RawObject } from "./object";
import { wrapObject, serializeObject } from "./serializer";
import { unwrapObject, parseObject } from "./parser";
import { decompress, compress } from "../util/compression";
import { sha1 } from "../util/hash";

export class ObjectStore {
  constructor(public path: PathBuilder) {}

  public async get(objectId: string): Promise<GitObject | null> {
    const rawObject = await this.getRaw(objectId);

    if (!rawObject) return null;

    return parseObject(rawObject);
  }

  public async add(object: GitObject): Promise<string> {
    const rawObject = serializeObject(object);
    return this.addRaw(rawObject);
  }

  public async addRaw(rawObject: RawObject): Promise<string> {
    const wrapped = wrapObject(rawObject);
    const id = sha1(wrapped);

    const compressed = await compress(wrapped);
    await this.writeEntry(id, compressed);

    return id;
  }

  public async getRaw(objectId: string): Promise<RawObject | null> {
    const compressed = await this.getEntry(objectId);

    if (!compressed) return null;

    const wrapped = await decompress(compressed);

    return unwrapObject(wrapped);
  }

  public async writeEntry(objectId: string, compressed: Buffer): Promise<void> {
    const path = this.path.object(objectId);

    await fs.writeFile(path, compressed);
  }

  public async getEntry(objectId: string): Promise<Buffer | null> {
    try {
      const path = this.path.object(objectId);

      return fs.readFile(path);
    } catch (e) {
      if (e.code === "ENOENT") {
        return null;
      }

      throw e;
    }
  }
}
