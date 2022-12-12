import { Repository } from "../repository";

export interface CreateBranchCommand {
  branchName: string;
}

export const createBranch = async (
  repo: Repository,
  command: CreateBranchCommand
): Promise<void> => {
  const headCommitId = await repo.refs.resolve("HEAD");
  await repo.refs.set(`refs/heads/${command.branchName}`, headCommitId);
};
