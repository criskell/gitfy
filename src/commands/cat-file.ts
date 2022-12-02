import { ObjectType, ObjectId } from "../objects/object";
import { serializeObject } from "../objects/serialization";
import { ObjectStore } from "../objects/store";

export interface CatFileRequest {
  objectId: ObjectId;
  type: ObjectType;
}

export interface CatFileResponse {
  raw: Buffer | null;
}

/**
 * Obtém um objeto pelo seu ID e retorna uma versão serializada ("crua")
 * do objeto.
 */
export const catFile = (store: ObjectStore) =>
  async (request: CatFileRequest): Promise<CatFileResponse> => {
  const object = await store.get(request.objectId);

  if (! object) return { raw: null };

  const raw = serializeObject(object);

  return { raw };
};