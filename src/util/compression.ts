import util from "util";
import zlib from "zlib";

export const compress = util.promisify(zlib.deflate);
export const decompress = util.promisify(zlib.inflate);
