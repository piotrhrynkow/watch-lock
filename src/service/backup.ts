import { join } from 'path';
import slugify from 'slugify';
import { ComposerModelType } from '../model/orm/types';

export default class Backup {
  public static getFilePath(
    directoryPath: string,
    composer: ComposerModelType
  ): string {
    return join(directoryPath, Backup.getFileName(composer));
  }

  public static getFileName(composer: ComposerModelType): string {
    return slugify(`composer-${composer.packName}-${Date.now()}.lock`);
  }
}
