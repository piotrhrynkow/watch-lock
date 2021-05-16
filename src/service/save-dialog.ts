import { SaveDialogOptions, remote } from 'electron';

export default class SaveDialog {
  public static async showSaveConfigDialog(): Promise<string | null> {
    return SaveDialog.showSaveDialog({
      filters: [{ name: 'Config', extensions: ['json'] }],
    });
  }

  public static async showSaveDialog(
    options: SaveDialogOptions
  ): Promise<string | null> {
    const dialogResult = await remote.dialog.showSaveDialog(options);
    if (!dialogResult.canceled && dialogResult.filePath) {
      return dialogResult.filePath;
    }

    return null;
  }
}
