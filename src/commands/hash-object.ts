import { ObjectType, ObjectId, generateObjectId } from "../objects/object";
import { ObjectStore } from "../objects/store";
import { Wrapper } from "../objects/wrapper";

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
  const wrapper = new Wrapper();

  wrapper.type = request.type;
  wrapper.body = request.body;

  const serializedWrapper = wrapper.serialize();

  const id = generateObjectId(serializedWrapper);

  if (request.write) {
    await store.writeRaw(id, serializedWrapper);
  }

  return { id };
};