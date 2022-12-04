import { ObjectType, ObjectId } from "../objects/object";
import { ObjectStore } from "../objects/store";
import { Commit } from "../objects/commit";

export interface LogRequest {
  commitId: string;
}

export interface LogResponse {
  log: string;
}

export const log = (store: ObjectStore) =>
  async (request: LogRequest): Promise<LogResponse> => {
  const commit = await store.get(request.commitId);

  if (commit.type !== ObjectType.COMMIT) {
    return { log: "" };
  }

  let log = "digraph {";

  const commits = [[request.commitId, commit] as const];

  for await (const [id, commit] of commits) {
    for await (const parentId of commit.parentIds) {
      log += `${id.slice(0, 6)}->${parentId.slice(0, 6)}`;
      commits.push([parentId, await store.get(parentId) as Commit]);
    }
  }

  log += "}";

  return { log };
};