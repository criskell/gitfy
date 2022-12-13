import fs from "fs/promises";
import nodePath from "path";

import { Ref, DirectRef } from "./ref";
import { listFiles } from "../util/filesystem";

export class RefStore {
  public constructor(public directory: string) {}

  async save(ref: Ref): Promise<void> {
    const value = ref.symbolic ? `ref: ${ref.value}` : ref.value;

    await this.write(ref.name, value);
  }

  resolve(name: string): Promise<DirectRef | null>;
  resolve(
    name: string,
    options?: { minDepth?: number; maxDepth?: number; }
  ): Promise<Ref | { name: string } | null> {
    options ??= {};
    options.minDepth ??= 1;
    options.maxDepth ??= Infinity;

    const resolve = async (name, currentDepth) => {
      const raw = await this.read(name);

      if (!raw) return { name };

      const symbolic = raw.startsWith("ref:");
      const value = symbolic ? raw.slice(5) : raw;

      const ref = {
        name,
        value,
        symbolic,
      };

      if (ref.symbolic) {
        return currentDepth < options.maxDepth
          ? resolve(ref.value, currentDepth + 1)
          : null;
      }

      return currentDepth < options.minDepth ? null : ref;
    };

    return resolve(name, 1);
  }

  path(name: string): string {
    return nodePath.join(this.directory, name);
  }

  async read(name: string): Promise<string> {
    try {
      return (await fs.readFile(this.path(name), "ascii")).slice(0, -1);
    } catch (e) {
      if (e.code === "ENOENT") {
        return null;
      }

      throw e;
    }
  }
  
  async write(name: string, value: string): Promise<void> {
    const path = this.path(name);
    await fs.mkdir(nodePath.dirname(path), { recursive: true });
    await fs.writeFile(path, value + "\n", "ascii");
  }
  
  async remove(name: string): Promise<void> {
    await fs.unlink(this.path(name));
  }
  
  async rename(sourceName: string, targetName: string): Promise<void> {
    await fs.rename(this.path(sourceName), this.path(targetName));
  }

  async list(options?: { dir?: string }): Promise<string[]> {
    options ??= {};

    const refsDir = this.path("refs");
    const directory = nodePath.join(refsDir, options.dir || "");
    const names = (await listFiles(directory))
      .map((path) => path.replace(this.directory + "/", ""));

    return names;
  }
}
