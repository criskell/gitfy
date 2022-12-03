import { serialize, deserialize } from "../../src/objects/message";

describe("objects/message", () => {
  describe("deserialize()", () => {
    it("deve desserializar uma mensagem serializada", () => {
      const message = deserialize("foo bar\nfoz baz\nbars fozfox\n foxfox\n foxfox\n\nthis is elon musk");

      expect(message).toEqual({
        headers: new Map([
          ["foo", "bar"],
          ["foz", "baz"],
          ["bars", "fozfox\nfoxfox\nfoxfox"],
        ]),
        body: "this is elon musk",
      });
    });
  });

  describe("serialize()", () => {
    it("deve serializar uma mensagem", () => {
      const message = {
        headers: new Map([
          ["foo", "bar"],
          ["foz", "baz"],
          ["bars", "fozfox\nfoxfox\nfoxfox"],
        ]),
        body: "this is elon musk",
      };

      expect(serialize(message)).toBe("foo bar\nfoz baz\nbars fozfox\n foxfox\n foxfox\n\nthis is elon musk");
    });
  });
});