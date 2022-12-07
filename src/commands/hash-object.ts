import { GitObject, ObjectType, ObjectId, generateObjectId } from '../objects';
import { ObjectStore } from '../objects/store';
import { Wrapper } from '../objects/wrapper';

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
export const hashObject =
  (store?: ObjectStore) =>
  async (request: HashObjectRequest): Promise<HashObjectResponse> => {
    const object = GitObject.from(new Wrapper(request.type, request.body));

    if (request.write) {
      await store.add(object);
    }

    return {
      id: object.id,
    };
  };
