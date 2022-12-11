import fs from "fs/promises";
import nodePath from "path";

import { fixturePath } from "../__support__";
import { Index } from "../../src/staging";
import { parseIndex } from "../../src/staging/parser";

describe("index/parser", () => {
  it("deve analisar um arquivo de índice", async () => {
    const rawIndex = await fs.readFile(fixturePath("index"));
    const index = parseIndex(rawIndex);

    expect(index.entries.length).toBe(3);
  });
});
