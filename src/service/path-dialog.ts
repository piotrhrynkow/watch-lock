import { OpenDialogOptions, remote } from 'electron';

export default class PathDialog {
  public static async showDirectoryDialog(): Promise<string | null> {
    return PathDialog.showSingleOpenDialog({
      properties: ['openDirectory'],
    });
  }

  public static async showFileDialog(): Promise<string | null> {
    return PathDialog.showSingleOpenDialog({
      properties: ['openFile'],
    });
  }

  public static async showConfigFileDialog(): Promise<string | null> {
    return PathDialog.showSingleOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Config', extensions: ['json'] }],
    });
  }

  private static async showSingleOpenDialog(
    options: OpenDialogOptions
  ): Promise<string | null> {
    const dialogResult = await remote.dialog.showOpenDialog(options);
    if (!dialogResult.canceled && dialogResult.filePaths.length) {
      return dialogResult.filePaths.pop() ?? null;
    }

    return null;
  }

  public static async showDirectoriesDialog(): Promise<string[]> {
    const dialogResult = await remote.dialog.showOpenDialog({
      properties: ['multiSelections', 'openDirectory'],
    });
    if (!dialogResult.canceled) {
      return dialogResult.filePaths;
    }

    return [];
  }
}
