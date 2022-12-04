import { ObjectType, ObjectId } from "../objects";
import { ObjectStore } from "../objects/store";

export interface CatFileRequest {
  objectId: ObjectId;
  type: ObjectType;
}

export interface CatFileResponse {
  body: Buffer | null;
}

/**
 * Obtém um objeto pelo seu ID e retorna uma versão serializada ("crua")
 * do objeto.
 */
export const catFile = (store: ObjectStore) =>
  async (request: CatFileRequest): Promise<CatFileResponse> => {
  const object = await store.get(request.objectId);

  const { body } = object.wrapper();

  return { body };
};