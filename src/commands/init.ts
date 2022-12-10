import nodePath from "path";

import { createTree } from "../util/filesystem";
import { encode, DEFAULT_CONFIG } from "../repository/config";

interface InitCommand {
  rootDirectory?: string;
  isBare?: boolean;
}

export const init = async (command: InitCommand = {}): Promise<void> => {
  command.rootDirectory ||= process.cwd();
  command.isBare ||= false;

  const { rootDirectory, isBare } = command;

  const gitDirectory = nodePath.join(rootDirectory, isBare ? "" : ".git");

  await createTree(
    {
      objects: {},
      refs: {
        heads: {},
        tags: {},
      },
      HEAD: "ref: refs/heads/master\n",
      config: encode({
        ...DEFAULT_CONFIG,
        core: {
          ...DEFAULT_CONFIG.core,
          bare: isBare,
        },
      }),
      description: "",
    },
    gitDirectory
  );
};
