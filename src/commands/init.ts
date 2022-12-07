import nodePath from 'path';

import { createTree } from '../util/filesystem';
import { encode, DEFAULT_CONFIG } from '../config';

interface InitRequest {
  /**
   * Caminho para o diretório raiz do repositório.
   *
   * Se o repositório não for bare, será criado um diretório .git.
   * Caso contrário, não será criado o diretório .git e a estrutura
   * do repositório será salva diretamente no diretório raiz.
   */
  rootDirectory?: string;

  /**
   * Indica se o repositório é do tipo bare.
   *
   * Assume `false` por padrão.
   */
  isBare?: boolean;
}

/**
 * Inicializa um repositório Git.
 */
export const init = async (request: InitRequest = {}) => {
  request.rootDirectory ||= process.cwd();
  request.isBare ||= false;

  const { rootDirectory, isBare } = request;

  const gitDirectory = nodePath.join(rootDirectory, isBare ? '' : '.git');

  await createTree(
    {
      objects: {},
      refs: {
        heads: {},
        tags: {},
      },
      HEAD: 'ref: refs/heads/master\n',
      config: encode({
        ...DEFAULT_CONFIG,
        core: {
          ...DEFAULT_CONFIG.core,
          bare: isBare,
        },
      }),
      description: '',
    },
    gitDirectory
  );
};
