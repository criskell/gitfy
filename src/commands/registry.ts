import { add } from "./add";
import { commit } from "./commit";
import { checkout } from "./checkout";
import { createBranch, deleteBranch } from "./branch";
import { addRemote } from "./remote";
import { Repository } from "../repository";

export const makeCommandRegistry = (repo: Repository) => ({
  add: add(repo),
  checkout: checkout(repo),
  commit: commit(repo),
  createBranch: createBranch(repo),
  deleteBranch: deleteBranch(repo),
  addRemote: addRemote(repo),
});