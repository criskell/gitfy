import { vol } from "memfs";
import fs from "fs/promises";

import { init } from "../../src/commands/init";
import { fetch } from "../../src/config";
import { exists } from "../../src/util/filesystem";

jest.mock("fs/promises");

describe("commands/init", () => {
  beforeEach(() => {
    vol.reset();
  });

  it("deve inicializar um repositório", async () => {
    await init({
      rootDirectory: "/",
    });

    expect(await exists("/.git/objects")).toBe(true);
    expect(await exists("/.git/refs/heads")).toBe(true);
    expect(await exists("/.git/refs")).toBe(true);
    expect(await exists("/.git/HEAD")).toBe(true);
    expect(await exists("/.git/config")).toBe(true);
    expect(await exists("/.git/description")).toBe(true);
  });

  it("deve inicializar um repositório bare", async () => {
    await init({
      rootDirectory: "/",
      isBare: true,
    });

    expect(await exists("/config")).toBe(true);
    expect(await fetch("/config")).toHaveProperty("core.bare", true);
  });
});