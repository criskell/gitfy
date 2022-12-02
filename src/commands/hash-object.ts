import { ObjectType, ObjectId } from "../objects/object";
import { ObjectStore } from "../objects/store";
import { generateObjectId } from "../objects/id";
import { compress } from "../util/compression";

export interface HashObjectRequest {
  type: ObjectType;
  data: Buffer;
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
  const size = request.data.length;
  const data = request.data;

  const header = Buffer.from(`${request.type} ${size}\0`, "ascii");
  const raw = Buffer.concat([header, data]);

  const objectId = generateObjectId(raw);

  if (request.write) {
    await store.set(objectId, await compress(raw));
  }

  return {
    id: objectId,
  };
};