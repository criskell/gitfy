import { Repository } from "../repository";

export interface ManageBranchCommand {
  branchName: string;
}

export const createBranch = (repo: Repository) => async (command: ManageBranchCommand): Promise<void> => {
  const currentHead = await repo.refs.resolve("HEAD");

  await repo.refs.save({
    name: `refs/heads/${command.branchName}`,
    value: currentHead.value,
  });
};

export const deleteBranch = (repo: Repository) => async (command: ManageBranchCommand): Promise<void> => {
  await repo.refs.remove(`refs/heads/${command.branchName}`);
};

interface RenameBranchCommand extends ManageBranchCommand {
  targetName: string;
}

export const renameBranch = (repo: Repository) => async (command: RenameBranchCommand): Promise<void> => {
  await repo.refs.rename(
    `refs/heads/${command.branchName}`,
    `refs/heads/${command.targetName}`
  );
};