import util from 'util';
import zlib from 'zlib';

const compressAsync = util.promisify(zlib.deflate);

export const compress = (data: Buffer): Promise<Buffer> =>
  compressAsync(data, { level: 1 });
export const decompress = util.promisify(zlib.inflate);
