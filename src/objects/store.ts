import fs from "fs/promises";

import { GitObject, ObjectId } from ".";
import { compress, decompress } from "../util/compression";

export class ObjectStore {
  constructor (public path: string) {}

  public async get(objectId: ObjectId): Promise<GitObject> {
    const objectPath = `${this.path}/${objectId.slice(0, 2)}/${objectId.slice(2)}`;

    try {
      const compressedEntry = await fs.readFile(objectPath);
      const entry = await decompress(compressedEntry);
      const object = new GitObject(entry, objectId);

      return object;
    } catch (e) {
      if (e.code === "ENOTENT") return null;
      throw e;
    }
  }

  public async add (object: GitObject): Promise<GitObject> {
    const directory = `${this.path}/${object.id.slice(0, 2)}`;
    const savePath = `${directory}/${object.id.slice(2)}`;

    const compressedEntry = await compress(object.content);

    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(savePath, compressedEntry);

    return object;
  }
}