import { promises as fsp, constants as fconst } from 'fs';

export class PathAccessChecker {
  public static async getPathAccess(
    path: string | null | undefined
  ): Promise<PathAccess> {
    if (path) {
      const [exists, readable, writable] = await Promise.all([
        PathAccessChecker.checkAccess(path, fconst.F_OK),
        PathAccessChecker.checkAccess(path, fconst.R_OK),
        PathAccessChecker.checkAccess(path, fconst.W_OK),
      ]);

      return { exists, readable, writable };
    }

    return {
      exists: false,
      readable: false,
      writable: false,
    };
  }

  private static async checkAccess(
    path: string,
    mode: number
  ): Promise<boolean> {
    try {
      await fsp.access(path, mode);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export interface PathAccess {
  exists: boolean;
  readable: boolean;
  writable: boolean;
}
