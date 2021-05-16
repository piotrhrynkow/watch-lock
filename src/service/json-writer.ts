import { copyFile, readFile, readJson, remove, writeJson } from 'fs-extra';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { forEach, replace } from 'lodash';
import diffStringsUnified from 'jest-diff';
import * as ansiHTML from 'ansi-html';
import chalk from 'chalk';
import detectNewline from 'detect-newline';
import { Lock, Package } from '../model/composer-lock';

dayjs.extend(utc);
chalk.level = 3;

export default class JsonWriter {
  public async saveFromFile(
    filePath: string,
    packs: Packs
  ): Promise<WriterResult> {
    const eol: string | null = await JsonWriter.detectFileNewline(filePath);
    if (!eol) {
      throw new Error(`Unable to detect newline for "${filePath}" file`);
    }
    const lockData: Lock = await readJson(filePath);
    forEach(packs, (hash: string, packName: string) => {
      ['packages-dev', 'packages'].forEach((packType: string) => {
        if (packType in lockData) {
          const packages: Package[] =
            lockData[
              packType as keyof Pick<Lock, 'packages-dev' | 'packages'>
            ] ?? [];
          forEach(packages, (pack: Package, packIndex: number) => {
            if (pack.name === packName) {
              packages[packIndex].source.reference = hash;
              packages[packIndex].time = this.getUTC();
            }
          });
        }
      });
    });
    const tmpFilePath: string = `${filePath}.tmp`;
    await copyFile(filePath, tmpFilePath);
    await writeJson(filePath, lockData, {
      spaces: 4,
      EOL: eol,
      flag: 'w',
    });
    const diffHtml = await JsonWriter.compareLocks(tmpFilePath, filePath);
    await remove(tmpFilePath);

    return {
      filePath,
      diffHtml,
    };
  }

  public static async detectFileNewline(
    filePath: string
  ): Promise<string | null> {
    return detectNewline((await readFile(filePath)).toString()) ?? null;
  }

  public static async compareLocks(
    lockPathX: string,
    lockPathY: string
  ): Promise<string> {
    const [bufferX, bufferY] = await Promise.all<Buffer>([
      readFile(lockPathX),
      readFile(lockPathY),
    ]);
    const diffResult =
      diffStringsUnified(bufferX.toString(), bufferY.toString(), {
        contextLines: 4,
        expand: false,
        includeChangeCounts: true,
        aAnnotation: 'Before',
        bAnnotation: 'After',
        aColor: chalk.red,
        bColor: chalk.green,
      }) ?? '';

    return JsonWriter.toHTML(diffResult);
  }

  private static toHTML(ansi: string): string {
    ansi = replace(ansi, /[ ]{2}/g, '&nbsp;');
    ansi = replace(ansi, /[ ]{1}/g, '&nbsp;');
    let html: string = ansiHTML(ansi);
    html = replace(html, /\n\r|\n/g, '<br />');

    return html;
  }

  private async isFilesEqual(filePathX: string, filePathY: string) {
    const [bufferX, bufferY] = await Promise.all<Buffer>([
      readFile(filePathX),
      readFile(filePathY),
    ]);

    return Buffer.compare(bufferX, bufferY) === 0;
  }

  private getUTC(): string {
    return dayjs().utc().format('YYYY-MM-DDTHH:mm:ssZ');
  }
}

declare type Packs = { [key: string]: Hash };
declare type Hash = string;

export type WriterResult = {
  filePath: string;
  diffHtml: string;
};
