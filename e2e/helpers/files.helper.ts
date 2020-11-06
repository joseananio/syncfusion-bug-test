import { copyFile, existsSync } from 'fs';
import { logger } from '../constants/logger';

const databaseFilePath = './third_party/twms-backend';

export async function backupDatabaseFile(databaseFileName, forceOverwrite = false) {
  const filePath = `${databaseFilePath}/${databaseFileName}`;
  const backupPath = `${filePath}`.replace(databaseFilePath, '.e2e-session');

  let fileExists = existsSync(filePath);

  if (!fileExists) {
    logger.error(`database file ${filePath} was supposed to be backed up, but it couldn't be found`);
    return;
  }

  fileExists = existsSync(backupPath);
  if (fileExists && !forceOverwrite) {
    return;
  }

  copyFile(filePath, backupPath, (err: any) => {
    if (err) {
      logger.error(`Exception when trying to backup ${filePath}: %o`, err);
      // logger.err(err);
    } else {
      logger.info(`database file ${filePath} was backed up to ${backupPath}`);
    }
  });
}

export async function restoreDatabaseFile(databaseFileName) {
  const filePath = `${databaseFilePath}/${databaseFileName}`;
  const backupPath = `${filePath}`.replace(databaseFilePath, '.e2e-session');

  const fileExists = existsSync(backupPath);

  if (!fileExists) {
    logger.error(`database backup file ${backupPath} was supposed to be restored, but it couldn't be found`);
    return;
  }

  copyFile(backupPath, filePath, (err) => {
    if (err) {
      logger.error(`Exception when trying to restore ${backupPath}: %o`, err);
      // logger.err(err);
    } else {
      logger.info(`database backup ${backupPath} was restored to ${filePath}`);
    }
  });
}
