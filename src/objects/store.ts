import fs from "fs/promises";
import nodePath from "path";

import { PathBuilder } from "../repository/path";
import { GitObject, isRawObject, ObjectType, RawObject } from "./object";
import { wrapObject, serializeObject } from "./serializer";
import { unwrapObject, parseObject } from "./parser";
import { decompress, compress } from "../util/compression";
import { sha1 } from "../util/hash";

interface FindOptions {
  type?: ObjectType;
  raw?: boolean;
}

interface FindOneOptions extends FindOptions {
  id: string;
}

type FindResult<F extends FindOptions> = F["raw"] extends true
  ? RawObject
  : Extract<GitObject, { type: F["type"] }>;

export class ObjectStore {
  constructor(public path: PathBuilder) {}

  findOne<F extends FindOneOptions>(options: F): Promise<FindResult<F> | null>;
  async findOne(
    options: FindOneOptions
  ): Promise<RawObject | GitObject | null> {
    const objectPath = this.path.object(options.id);
    const wrapped = await this.read(objectPath);

    if (!wrapped) return null;

    const rawObject = unwrapObject(wrapped);

    if (options.type && rawObject.type !== options.type) return null;
    if (options.raw) return rawObject;

    return parseObject(rawObject);
  }

  async add(object: GitObject | RawObject): Promise<{ id: string }> {
    const wrapped = isRawObject(object)
      ? wrapObject(object)
      : wrapObject(serializeObject(object));
    const objectId = sha1(wrapped);
    const objectPath = this.path.object(objectId);

    await this.write(objectPath, wrapped);

    return {
      id: objectId,
    };
  }

  async read(path: string): Promise<Buffer | null> {
    try {
      const compressedObject = await fs.readFile(path);
      return decompress(compressedObject);
    } catch (e) {
      if (e.code === "ENOTENT") {
        return null;
      }

      throw e;
    }
  }

  async write(path: string, wrapped: Buffer): Promise<void> {
    await fs.mkdir(nodePath.dirname(path), { recursive: true });
    await fs.writeFile(path, await compress(wrapped));
  }
}
