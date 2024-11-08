import async from 'async';
import fs from 'node:fs';
import nodePath from 'node:path';
import readdirSyncRecursive from '@lxf2513/readdir-sync-recursive';

function isFile(path: string) {
  try {
    const stat = fs.statSync(path);
    return stat.isFile();
  } catch (error) {
    return false;
  }
}

function isDirectory(path: string) {
  try {
    const stat = fs.statSync(path);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * copy directory recursively like `cp -r` command
 * @param source source directory
 * @param dest destination directory
 * @param limit the max number of open files one time(default 6)
 */
function copyDir(source: string, dest: string, limit: number = 6) {
  const list = readdirSyncRecursive(source);
  const files = list.filter((l) => isFile(nodePath.join(source, l)));
  const dirs = list.filter((l) => isDirectory(nodePath.join(source, l)));
  for (const dir of dirs) {
    const destPath = nodePath.join(dest, dir);
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(nodePath.join(source, dir), destPath, limit);
    }
  }
  async.eachLimit(files, limit, (file, next) => {
    const srcPath = nodePath.join(source, file);
    const destPath = nodePath.join(dest, file);
    const readStream = fs.createReadStream(srcPath);
    const writeStream = fs.createWriteStream(destPath);
    readStream.pipe(writeStream);
    writeStream.on('finish', next);
  });
}

export { copyDir as default };
