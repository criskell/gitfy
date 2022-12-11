import fs from "fs/promises";
import nodePath from "path";

import { PathBuilder } from "../repository/path";
import { GitObject, ParsedObject, RawObject, ObjectType } from "./object";
import { wrapObject, serializeObject } from "./serializer";
import { unwrapObject, parseObject } from "./parser";
import { decompress, compress } from "../util/compression";
import { sha1 } from "../util/hash";

export interface FindOneOptions {
  /**
   * O identificador de objeto para encontrar.
   */
  id: string;

  /**
   * O tipo de objeto para encontrar.
   */
  type?: ObjectType;

  /**
   * Indica se o objeto encontrado deve ter seus dados
   * não analisados.
   *
   * Esta opção por padrão deve ser false.
   */
  raw?: boolean;
}

export type FindOneResult<F extends FindOneOptions> = F["raw"] extends true
  ? RawObject
  : Extract<ParsedObject, { type: F["type"] }>;

type Test0 = FindOneResult<{
  id: "aa";
  raw: true;
  type: "commit";
}>;

/**
 * Banco de dados de objetos.
 */
export class ObjectStore {
  constructor(public path: PathBuilder) {}

  /**
   * Encontra um objeto e o retorna, de acordo com as opções dadas.
   */
  public async findOne<F extends FindOneOptions>(
    options: F
  ): Promise<FindOneResult<F> | null>;
  public async findOne(options: FindOneOptions): Promise<GitObject | null> {
    options.raw ??= false;

    const objectPath = this.path.object(options.id);
    const wrapped = await getDecompressedObject(objectPath);

    if (!wrapped) return null;

    const rawObject = unwrapObject(wrapped);

    if (options.type && rawObject.type !== options.type) return null;
    if (options.raw) return rawObject;

    return parseObject(rawObject);
  }

  /**
   * Adiciona um objeto no banco de dados.
   */
  public async add(object: GitObject): Promise<{ id: string }> {
    const wrapped = Buffer.isBuffer(object.data)
      ? wrapObject(object as any)
      : wrapObject(serializeObject(object as any));
    const objectId = sha1(wrapped);
    const objectPath = this.path.object(objectId);

    await saveObject(objectPath, wrapped);

    return {
      id: objectId,
    };
  }
}

/**
 * Obtém o conteúdo descomprimido de um objeto.
 */
export const getDecompressedObject = async (path: string): Promise<Buffer> => {
  try {
    const compressedObject = await fs.readFile(path);
    return decompress(compressedObject);
  } catch (e) {
    if (e.code === "ENOTENT") {
      return null;
    }

    throw e;
  }
};

/**
 * Salva um objeto com o corpo encapsulado com os cabeçalhos.
 */
export const saveObject = async (
  path: string,
  wrapped: Buffer
): Promise<void> => {
  await fs.mkdir(nodePath.dirname(path), { recursive: true });
  await fs.writeFile(path, await compress(wrapped));
};
