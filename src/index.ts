import async from 'async';
import {
  statSync,
  existsSync,
  mkdirSync,
  createReadStream,
  createWriteStream
} from 'node:fs';
import readdirSyncRecursive from '@lxf2513/readdir-sync-recursive';

function type(path: string) {
  try {
    const stat = statSync(path);
    return stat.isDirectory() ? 'dir' : stat.isFile() ? 'file' : undefined;
  } catch {
    return undefined;
  }
}

/**
 * copy directory recursively like `cp -r` command
 * @param source source directory
 * @param dest destination directory
 * @param limit the max number of open files at a time
 */
function copyDir(source: string, dest: string, limit: number | undefined) {
  const list = readdirSyncRecursive(source, 'relativePath');
  const files = list.filter((l) => type(l) === 'file');
  const dirs = list.filter((l) => type(l) === 'dir');
  for (const dir of dirs) {
    const _dest = dir.replace(source, dest);
    if (!existsSync(_dest)) {
      mkdirSync(_dest, { recursive: true });
      copyDir(dir, _dest, undefined);
    }
  }
  if (typeof limit !== 'number' || !files.length) {
    return;
  }
  async.eachLimit(files, limit, (file, next) => {
    const _dest = file.replace(source, dest);
    const s = createReadStream(file);
    const d = createWriteStream(_dest);
    s.pipe(d);
    d.on('finish', next);
  });
}

export { copyDir as default };
