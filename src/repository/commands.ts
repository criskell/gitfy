import { add } from "../commands/add";
import { commit } from "../commands/commit";
import { checkout } from "../commands/checkout";
import { Repository } from "./repository";

export const initCommands = (repo: Repository) => ({
  add: add.bind(null, repo),
  checkout: checkout.bind(null, repo),
  commit: commit.bind(null, repo),
});