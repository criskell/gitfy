import mockfs from "mock-fs";

afterEach(() => {
  mockfs.restore();
});
