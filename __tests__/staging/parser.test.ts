import fs from "fs/promises";
import nodePath from "path";

import { Index } from "../../src/staging";
import { parseIndex } from "../../src/staging/parser";

describe("index/parser", () => {
  it("deve analisar um arquivo de índice", async () => {
    const rawIndex = await fs.readFile(nodePath.join(__dirname, "..", "..", "__fixtures__", "index"));
    const index = parseIndex(rawIndex);

    expect(index).toHaveProperty("entries.length", 3);
    expect(index).toHaveProperty("checksum", "f302f165b396cfb52a5542eeb7f94804744d2220");
  });
});