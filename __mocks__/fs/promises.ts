import { ufs } from "unionfs";
import { fs } from "memfs";

ufs.use(fs as any);

export default ufs.promises;