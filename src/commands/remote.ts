import { Repository } from "../repository";

interface ManageRemoteCommand {
  remoteName: string;
}

interface AddRemoteCommand extends ManageRemoteCommand {
  url: string;
}

export const addRemote = (repo: Repository) => async (command: AddRemoteCommand): Promise<void> => {
  const fetchSpec = `+refs/heads/*:refs/remotes/${command.remoteName}/*`;

  repo.config.data.remote ||= {};
  repo.config.data.remote[command.remoteName] ||= {};
  repo.config.data.remote[command.remoteName].url = command.url;
  repo.config.data.remote[command.remoteName].fetch = fetchSpec;

  await repo.config.save();
};

export const removeRemote = (repo: Repository) => async (command: ManageRemoteCommand): Promise<void> => {
  if (repo.config.data.remote) {
    delete repo.config.data.remote[command.remoteName];

    await repo.config.save();
  }
};