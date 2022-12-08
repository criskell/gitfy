import fs from "fs/promises";
import nodePath from "path";

export class RefStore {
  public constructor(public gitDirectory: string) {}

  public async set(name: string, content: string) {
    const fullPath = this.path(name);

    await fs.mkdir(nodePath.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content + "\n", "ascii");
  }

  public async link(from: string, to: string) {
    await this.set(from, `ref: ${to}`);
  }

  public async resolve(name: string): Promise<string | null> {
    const content = (await fs.readFile(this.path(name), "ascii")).slice(0, -1);

    if (content.startsWith("ref: ")) {
      const linkedRef = content.slice(5);
      return this.resolve(linkedRef);
    }

    return content;
  }

  public path(name: string) {
    return nodePath.join(this.gitDirectory, name);
  }
}
