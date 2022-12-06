import { vol } from "memfs";

export const setupFs = () => {
  beforeEach(() => {
    vol.reset();
  });
};