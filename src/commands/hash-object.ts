import { ObjectType, ObjectId, generateObjectId } from "../objects/object";
import { ObjectStore } from "../objects/store";
import { serialize as serializeWrapper } from "../objects/wrapper";

export interface HashObjectRequest {
  type: ObjectType;
  body: Buffer;
  write: boolean;
}

export interface HashObjectResponse {
  id: ObjectId;
}

/**
 * Converte os dados fornecidos em um objeto Git, calcula seu identificador
 * e opcionalmente escreve no banco de dados de objetos.
 */
export const hashObject = (store?: ObjectStore) =>
  async (request: HashObjectRequest): Promise<HashObjectResponse> => {
  const wrapped = serializeWrapper({
    type: request.type,
    body: request.body,
  });
  const id = generateObjectId(wrapped);

  if (request.write) {
    await store.writeRaw(id, wrapped);
  }

  return { id };
};