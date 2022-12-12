import { Repository } from "../repository";

export interface DeleteBranchCommand {
  branchName: string;
}

export const createBranch = async (
  repo: Repository,
  command: DeleteBranchCommand
): Promise<void> => {
  await repo.refs.delete(`refs/heads/${command.branchName}`);
};
