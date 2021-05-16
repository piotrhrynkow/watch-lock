import { readJson } from 'fs-extra';
import { join as joinPath } from 'path';
import { Store } from 'redux';
import simpleGit, { SimpleGit } from 'simple-git';
import { Package } from '../model/composer-lock';
import {
  setComposerPackModel,
  setPackModel,
  updateComposerModel,
  updateComposerPackModel,
  upsertComposerModel,
  upsertProjectModel,
} from '../store/actions';
import { FileInfo, FileInfoReader } from './file-info-reader';
import { PathAccessChecker } from './path-access-checker';
import Composer, { ComposerModelType } from '../model/orm/composer';
import { PackModelType } from '../model/orm/pack';
import { ComposerPackModelType } from '../model/orm/composer-pack';
import AbstractModelService from './abstract-model-service';
import { ProjectModelType } from '../model/orm/project';

export default class ProjectProcessor extends AbstractModelService {
  private projectModel: ProjectModelType;

  public constructor(
    private readonly store: Store,
    private readonly project: Project
  ) {
    super();
  }

  protected getStore(): Store {
    return this.store;
  }

  public async process(): Promise<void> {
    this.projectModel = await this.initializeProject();

    await Promise.all([this.processComposer(), this.processGit()]);

    this.dispatch(upsertProjectModel(this.projectModel));
  }

  private async initializeProject(): Promise<ProjectModelType> {
    const access = await PathAccessChecker.getPathAccess(
      this.project.directoryPath
    );
    let projectModel: ProjectModelType | null = this.getProjectModel(
      this.project.directoryPath
    );
    if (!projectModel) {
      projectModel = {
        id: this.project.id ?? this.generateUUID(),
        rootDirectory: {
          path: this.project.directoryPath,
          access,
        },
        git: null,
      };
    } else {
      projectModel.rootDirectory.access = access;
    }

    return projectModel as ProjectModelType;
  }

  public async processComposer(): Promise<void> {
    let composerModelInstance:
      | ComposerModelType
      | undefined = this.getComposerModel(this.projectModel.id);
    if (!composerModelInstance) {
      composerModelInstance = {
        id: this.generateUUID(),
        packName: null,
        jsonPath: joinPath(this.project.directoryPath, 'composer.json'),
        lockPath: joinPath(this.project.directoryPath, 'composer.lock'),
        projectId: this.projectModel.id,
      };
    }
    const { directoryPath, filename, path } = Composer.parseFilePath(
      composerModelInstance?.lockPath
    );
    composerModelInstance = {
      ...composerModelInstance,
      directoryPath,
      filename,
      path,
    };
    const jsonAccess = await PathAccessChecker.getPathAccess(composerModelInstance?.jsonPath);
    const lockAccess = await PathAccessChecker.getPathAccess(composerModelInstance?.lockPath);
    let info: FileInfo | null = null;
    if (lockAccess.exists) {
      info = await FileInfoReader.getInfo(path);
    }
    composerModelInstance = {
      ...composerModelInstance,
      access: lockAccess,
      info,
    };
    this.dispatch(upsertComposerModel(composerModelInstance));

    const composerModel: ComposerModelType = composerModelInstance;

    if (jsonAccess.readable) {
      const { name: packName } = await readJson(composerModel.jsonPath);
      composerModel.packName = packName;
      this.dispatch(updateComposerModel(composerModel));
    }

    if (composerModel.access.readable) {
      const { packages: composerPacks } = await readJson(composerModel.path);
      composerPacks?.forEach((composerPackage: Package) => {
        let packModelInstance: PackModelType | undefined = this.getPackModel(
          composerPackage.name
        );
        if (!packModelInstance) {
          packModelInstance = {
            id: this.generateUUID(),
            name: composerPackage.name,
            sourceUrl: composerPackage.source.url,
          };
          this.dispatch(setPackModel(packModelInstance));
        }
        const packModel: PackModelType = packModelInstance;
        let composerPackModelInstance:
          | ComposerPackModelType
          | undefined = this.getComposerPackModel(
          composerModel.id,
          packModel.id
        );
        if (!composerPackModelInstance) {
          composerPackModelInstance = {
            id: this.generateUUID(),
            hash: composerPackage.source.reference,
            time: new Date(composerPackage.time),
            composerId: composerModel.id,
            packId: packModel.id,
          };
          this.dispatch(setComposerPackModel(composerPackModelInstance));
        } else {
          composerPackModelInstance = {
            ...composerPackModelInstance,
            hash: composerPackage.source.reference,
            time: new Date(composerPackage.time),
          };
          this.dispatch(updateComposerPackModel(composerPackModelInstance));
        }
      });
    }
  }

  public async processGit(): Promise<void> {
    if (this.project.directoryPath) {
      const access = await PathAccessChecker.getPathAccess(
        this.project.directoryPath
      );
      if (!access.exists) {
        this.projectModel.git = {
          ...this.projectModel.git,
          exists: false,
        };
      } else {
        this.projectModel.git = {
          ...this.projectModel.git,
          exists: await ProjectProcessor.hasGitDirectory(
            this.project.directoryPath
          ),
        };
      }
    }
  }

  private static async hasGitDirectory(
    directoryPath: string
  ): Promise<boolean> {
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

  private getProjectModel = (
    directoryPath: string
  ): ProjectModelType | null => {
    const { Project } = this.getModelSession();

    const filteredProjects = Project.all()
      .filter((project) => project.rootDirectory.path === directoryPath)
      .toRefArray();

    return filteredProjects.pop() ?? null;
  };

  private getComposerModel = (
    projectId: string
  ): ComposerModelType | undefined => {
    const { Composer } = this.getModelSession();
    const filteredComposers = Composer.all()
      .filter((composer) => composer.projectId === projectId)
      .toRefArray();

    return filteredComposers.pop();
  };

  private getPackModel = (packName: string): PackModelType | undefined => {
    const { Pack } = this.getModelSession();

    const filteredPacks = Pack.all()
      .filter((pack) => pack.name === packName)
      .toRefArray();

    return filteredPacks.pop();
  };

  private getComposerPackModel = (
    composerId: string,
    packId: string
  ): ComposerPackModelType | undefined => {
    const { ComposerPack } = this.getModelSession();

    const filteredComposerPacks = ComposerPack.all()
      .filter(
        (composerPack) =>
          composerPack.composerId === composerId &&
          composerPack.packId === packId
      )
      .toRefArray();

    return filteredComposerPacks.pop();
  };
}

declare type Project = {
  id?: string;
  directoryPath: string;
  composerJsonPath: string;
  composerLockPath: string;
  gitDirectoryPath: string;
};
