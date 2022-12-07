import fs from 'fs/promises';
import nodePath from 'path';

import { exists } from '../util/filesystem';
import { fetch as fetchConfig } from '../config';
import { Repository } from '../repository';

const findGitDirectory = async (path: string): Promise<string | null> => {
  const gitDirectory = nodePath.join(path, '.git');

  if (
    (await exists(gitDirectory)) &&
    (await fs.lstat(gitDirectory)).isDirectory()
  ) {
    return gitDirectory;
  }

  const configPath = nodePath.join(path, 'config');

  if ((await exists(configPath)) && (await fs.lstat(configPath)).isFile()) {
    const config = await fs.readFile(configPath, 'utf8');

    if (config.includes('core')) return path;
  }

  return path === '/' ? null : findGitDirectory(nodePath.dirname(path));
};

export const loadRepository = async (
  path?: string
): Promise<Repository | null> => {
  const gitDirectory = await findGitDirectory(path || process.cwd());

  if (!gitDirectory) return null;

  const config = await fetchConfig(nodePath.join(gitDirectory, 'config'));
  const repo = new Repository(gitDirectory, config);

  return repo;
};
