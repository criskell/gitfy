import { ObjectType } from "../../src/objects/object";
import { serialize, deserialize } from "../../src/objects/wrapper";

describe("objects/wrapper", () => {
  describe("serialize()", () => {
    it("deve encapsular um objeto serializado", async () => {
      const serializedWrapper = serialize({
        type: ObjectType.BLOB,
        body: Buffer.from("lol", "ascii"),
      });

      const expected = Buffer.from("blob 3\0lol", "ascii");

      expect(serializedWrapper).toEqual(expected);
    });
  });

  describe("deserialize()", () => {
    it("deve desencapsular um objeto serializado", async () => {
      const serializedWrapper = Buffer.from("blob 1\0a", "ascii");

      const wrapper = deserialize(serializedWrapper);

      expect(wrapper).toBeDefined();
      expect(wrapper.type).toBe("blob");
      expect(wrapper.body).toEqual(Buffer.from("a", "ascii"));      
    });
  });
});