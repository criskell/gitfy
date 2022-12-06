import fs from "fs/promises";
import nodePath from "path";

import { Index } from "../../src/staging";
import { parseIndex } from "../../src/staging/parser";
import { serializeIndex } from "../../src/staging/serializer";
import { sha1 } from "../../src/util/hash";

describe("index/serializer", () => {
  it("deve serializar um objeto de índice", async () => {
    const rawIndex = await fs.readFile(nodePath.join(__dirname, "..", "..", "__fixtures__", "index"));
    const index = parseIndex(rawIndex);
    const serialized = serializeIndex(index);

    // Retorna somente os headers e as entries sem as extensões
    const headerAndEntriesFromIndex = rawIndex.subarray(0, 0x000000E4);

    expect(serialized.subarray(0, -20)).toEqual(headerAndEntriesFromIndex);
  });
});