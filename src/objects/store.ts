import fs from "fs/promises";

import {
  GitObject,
  ObjectId,
  generateObjectId,
  ObjectType
} from "./object";
import { Wrapper } from "./wrapper";
import { Commit } from "./commit";
import { Blob } from "./blob";
import { Tree } from "./tree";
import { compress, decompress } from "../util/compression";

export class ObjectStore {
  constructor (public path: string) {
    //
  }

  public async get(id: ObjectId): Promise<GitObject> {
    const serializedWrapper = await this.readRaw(id);

    if (! serializedWrapper) return null;

    const wrapper = Wrapper.from(serializedWrapper);

    if (wrapper.type === ObjectType.COMMIT) {
      return Commit.from(wrapper.body);
    }

    if (wrapper.type === ObjectType.BLOB) {
      return Blob.from(wrapper.body);
    }

    if (wrapper.type === ObjectType.TREE) {
      return Tree.from(wrapper.body);
    }
  }

  public async add (object: GitObject): Promise<string> {
    const wrapper = new Wrapper();

    wrapper.type = object.type;

    if (object.type === ObjectType.BLOB
      || object.type === ObjectType.COMMIT
      || object.type === ObjectType.TREE) {
      wrapper.body = object.serialize();
    }

    const serializedWrapper = wrapper.serialize();

    const objectId = generateObjectId(serializedWrapper);

    await this.writeRaw(objectId, serializedWrapper);

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