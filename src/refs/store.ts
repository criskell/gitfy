import fs from "fs/promises";
import nodePath from "path";

export interface Ref {
  name: string;
  content?: string;
}

export class RefStore {
  public constructor(public gitDirectory: string) {}

  public async set(name: string, content: string) {
    const fullPath = this.path(name);

    await fs.mkdir(nodePath.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content + "\n", "ascii");
  }

  public async delete(name: string) {
    const fullPath = this.path(name);

    await fs.unlink(fullPath);
  }

  public async link(from: string, to: string) {
    await this.set(from, `ref: ${to}`);
  }

  public async getDirectRef(name: string): Promise<Ref> {
    try {
      const path = this.path(name);
      const data = await fs.readFile(path, "ascii");
      const content = data.slice(0, -1);

      if (content.startsWith("ref: ")) {
        const linkedRef = content.slice(5);
        return this.getDirectRef(linkedRef);
      }

      return {
        name,
        content,
      };
    } catch (e) {
      if (e.code === "ENOENT") {
        return {
          name,
        };
      }

      throw e;
    }
  }

  public async resolve(name: string): Promise<string | null> {
    const { content } = await this.getDirectRef(name);

    if (!content) return null;

    return content;
  }

  public path(name: string) {
    return nodePath.join(this.gitDirectory, name);
  }
}
