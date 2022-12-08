import crypto from "crypto";

export const sha1 = (content: Buffer): string => {
  const hash = crypto.createHash("sha1");
  hash.update(content);
  return hash.digest("hex");
};
