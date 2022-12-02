import fs from "fs/promises";

import { GitObject } from "./object";
import { wrapObject } from "./wrapper";
import { generateObjectId } from "./id";

export class ObjectStore {
  constructor (public path: string) {}

  public async add (object: GitObject): Promise<string> {
    const wrapped = await wrapObject(object);
    const objectId = generateObjectId(wrapped);
    const directory = `${this.path}/${objectId.slice(0, 2)}`;
    const savePath = `${directory}/${objectId.slice(2)}`;

    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(savePath, wrapped);

    return objectId;
  }
}