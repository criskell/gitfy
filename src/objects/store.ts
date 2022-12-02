import fs from "fs/promises";

import { GitObject, ObjectId } from "./object";
import { wrapObject, unwrapObject } from "./wrapper";
import { generateObjectId } from "./id";

export class ObjectStore {
  constructor (public path: string) {}

  public async get (id: ObjectId): Promise<GitObject | null> {
    const objectPath = `${this.path}/${id.slice(0, 2)}/${id.slice(2)}`;

    try {
      const content = await fs.readFile(objectPath);

      return unwrapObject(content);
    } catch (e) {
      if (e.code === "ENOTENT") return null;
      throw e;
    }
  }

  public async add (object: GitObject): Promise<string> {
    const { objectId, data } = await wrapObject(object);
    const directory = `${this.path}/${objectId.slice(0, 2)}`;
    const savePath = `${directory}/${objectId.slice(2)}`;

    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(savePath, data);

    return objectId;
  }
}