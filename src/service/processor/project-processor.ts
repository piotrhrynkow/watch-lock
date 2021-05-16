import { Store } from 'redux';
import simpleGit, { SimpleGit } from 'simple-git';
import { OrmSession } from 'redux-orm/Session';
import { IndexedModelClasses } from 'redux-orm/ORM';
import AbstractModelService from './abstract-model-service';
import { PathAccessChecker } from '../path-access-checker';
import { upsertProjectModel } from '../../store/actions';
import { ProjectModelType } from '../../model/orm/types';

export default class ProjectProcessor extends AbstractModelService {
  public constructor(
    private readonly store: Store,
    private readonly projectModel: ProjectModelType
  ) {
    super();
  }

  protected getStore(): Store {
    return this.store;
  }

  public async process(): Promise<ProjectModelType> {
    await Promise.all([this.checkId(), this.checkAccess(), this.checkGit()]);

    return this.projectModel;
  }

  public flush(): void {
    this.dispatch(upsertProjectModel(this.projectModel));
  }

  public static getByDirectoryPath(
    session: OrmSession<IndexedModelClasses<any, string | number | symbol>>,
    directoryPath: string
  ): ProjectModelType | null {
    const { Project } = session;

    const filteredProject = Project.all()
      .filter((project) => project.rootDirectory.path === directoryPath)
      .last();

    return filteredProject?.ref ?? null;
  }

  private async checkId(): Promise<void> {
    if (!this.projectModel.id) {
      this.projectModel.id = this.generateUUID();
    }
  }

  private async checkAccess(): Promise<void> {
    const access = await PathAccessChecker.getPathAccess(
      this.projectModel.rootDirectory.path
    );
    this.projectModel.rootDirectory = {
      ...this.projectModel.rootDirectory,
      access,
    };
  }

  private async checkGit(): Promise<void> {
    await this.checkGitPath();
    await this.checkGitAccess();
    if (this.projectModel.git.access.readable) {
      await this.checkGitRepo();
    }
  }

  private async checkGitPath(): Promise<void> {
    if (!this.projectModel.git?.path) {
      this.projectModel.git = {
        ...this.projectModel.git,
        path: this.projectModel.rootDirectory.path,
      };
    }
  }

  private async checkGitAccess(): Promise<void> {
    const access = await PathAccessChecker.getPathAccess(
      this.projectModel.git.path
    );
    this.projectModel.git = {
      ...this.projectModel.git,
      access,
    };
  }

  private async checkGitRepo(): Promise<void> {
    this.projectModel.git.hasRepo = await this.hasGitRepo(
      this.projectModel.git.path
    );
  }

  private async hasGitRepo(directoryPath: string): Promise<boolean> {
    try {
      const git: SimpleGit = simpleGit(directoryPath);
      return await git.checkIsRepo('root');
    } catch (e) {
      if (e.message.includes('not a git repository')) {
        return false;
      }
      throw e;
    }
  }
}
