import { add } from "./add";
import { commit } from "./commit";
import { checkout } from "./checkout";
import { createBranch, deleteBranch, renameBranch } from "./branch";
import { addRemote, removeRemote } from "./remote";
import { Repository } from "../repository";

export const makeCommandRegistry = (repo: Repository) => ({
  add: add(repo),
  checkout: checkout(repo),
  commit: commit(repo),
  createBranch: createBranch(repo),
  deleteBranch: deleteBranch(repo),
  renameBranch: renameBranch(repo),
  addRemote: addRemote(repo),
  removeRemote: removeRemote(repo),
});