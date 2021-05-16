import { stat, Stats } from 'fs-extra';

export class FileInfoReader {
  public static async getInfo(path: string): Promise<FileInfo> {
    const info: Stats = await stat(path);

    return {
      size: info.size,
      createdAt: info.birthtime,
      updatedAt: info.mtime,
    };
  }
}

export interface FileInfo {
  size: number;
  createdAt: Date;
  updatedAt: Date;
}
