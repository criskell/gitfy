import { ObjectType, ObjectId } from "../objects";
import { ObjectStore } from "../objects/store";

export interface LogRequest {
  commitId: string;
}

export interface LogResponse {
  log: string;
}

export const log =
  (store: ObjectStore) =>
  async (request: LogRequest): Promise<LogResponse> => {
    let log = "digraph {";

    const commitIds = [request.commitId];

    for await (const commitId of commitIds) {
      const object = await store.get(commitId);
      const commit = object.body();

      if (commit.type !== ObjectType.COMMIT) continue;

      for await (const parentId of commit.parentIds) {
        log += `${commitId.slice(0, 6)}->${parentId.slice(0, 6)}`;
        commitIds.push(parentId);
      }
    }

    log += "}";

    return { log };
  };
