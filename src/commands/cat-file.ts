import { ObjectType, ObjectId } from "../objects/object";
import { ObjectStore } from "../objects/store";
import { Wrapper } from "../objects/wrapper";

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
  const raw = await store.readRaw(request.objectId);

  if (! raw) return { body: null };

  const { body } = Wrapper.from(raw);

  return { body };
};