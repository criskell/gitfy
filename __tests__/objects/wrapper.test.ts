import * as blob from "../../src/objects/blob";
import { ObjectType } from "../../src/objects/object";
import { generateObjectId } from "../../src/objects/id";
import { wrapObject, unwrapObject } from "../../src/objects/wrapper";
import { compress, decompress } from "../../src/util/compression";

describe("objects/wrapper", () => {
  describe("wrapObject()", () => {
    it("deve encapsular um objeto blob e retornar seu id", async () => {
      const { objectId, data } = await wrapObject({
        type: ObjectType.BLOB,
        content: Buffer.from("lol", "ascii"),
      });

      const raw = Buffer.from("blob 3\0lol", "ascii");

      expect(data).toEqual(await compress(raw));
      expect(objectId).toEqual(generateObjectId(raw));
    });
  });

  describe("unwrapObject()", () => {
    it("deve desencapsular um objeto blob", async () => {
      const wrappedObject = await compress(Buffer.from("blob 1\0a", "ascii"));

      const unwrappedObject = await unwrapObject(wrappedObject);

      expect(unwrappedObject).toBeDefined();
      expect(unwrappedObject.type).toBe("blob");
      expect(unwrappedObject.content).toEqual(Buffer.from("a", "ascii"));      
    });
  });
});