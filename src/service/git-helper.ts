import simpleGit, { SimpleGit, GitPluginError } from 'simple-git';

export default class GitHelper {
  private readonly git: SimpleGit;

  public constructor(private readonly directoryPath: string) {
    this.git = simpleGit(this.directoryPath, {
      timeout: {
        block: 3000,
      },
    });
  }

  public async getCurrentBranch(): Promise<string | null> {
    const statusResult = await this.git.status();

    return statusResult.current ?? null;
  }

  public async getRemoteHash(branchName: string): Promise<string | null> {
    try {
      const remoteResult = await this.git.listRemote(['origin', branchName]);
      if (remoteResult) {
        const [hash, ref] = remoteResult.split('\t');

        return hash;
      }
    } catch (error) {
      if (error instanceof GitPluginError && error.plugin === 'timeout') {
        throw new Error(
          `Unable to fetch remote hash. Check internet connection or credentials in ${this.directoryPath}`
        );
      }
    }

    return null;
  }
}
