import { Store } from 'redux';
import { readJson } from 'fs-extra';
import { join as joinPath } from 'path';
import { unionBy } from 'lodash';
import { OrmSession } from 'redux-orm/Session';
import { IndexedModelClasses } from 'redux-orm/ORM';
import AbstractModelService from './abstract-model-service';
import { PathAccessChecker } from '../path-access-checker';
import { upsertComposerModel } from '../../store/actions';
import { Package } from '../../model/composer-lock';
import { ComposerModelType, ProjectModelType } from '../../model/orm/types';

enum FileType {
  JSON = 'json',
  LOCK = 'lock',
}

export default class ComposerProcessor extends AbstractModelService {
  public constructor(
    private readonly store: Store,
    private readonly composerModel: ComposerModelType,
    private readonly projectModel: ProjectModelType
  ) {
    super();
  }

  protected getStore(): Store {
    return this.store;
  }

  public async process(): Promise<ComposerModelType> {
    await Promise.all([
      this.checkId(),
      this.checkProjectId(),
      this.checkJson(),
      this.checkLock(),
    ]);

    return this.composerModel;
  }

  public static async getLockPackages(
    composerModel: ComposerModelType
  ): Promise<Package[]> {
    if (composerModel.lock.access.readable) {
      const {
        packages: composerProdPacks,
        'packages-dev': composerDevPacks,
      } = await readJson(composerModel.lock.path);

      return unionBy<Package>(composerProdPacks, composerDevPacks, 'name');
    }

    return [];
  }

  public flush(): void {
    this.dispatch(upsertComposerModel(this.composerModel));
  }

  public static getByProjectId = (
    session: OrmSession<IndexedModelClasses<any, string | number | symbol>>,
    projectId: string
  ): ComposerModelType | null => {
    const { Composer } = session;
    const filteredComposer = Composer.all()
      .filter((composer) => composer.projectId === projectId)
      .last();

    return filteredComposer?.ref ?? null;
  };

  private async checkId(): Promise<void> {
    if (!this.composerModel.id) {
      this.composerModel.id = this.generateUUID();
    }
  }

  private async checkProjectId(): Promise<void> {
    if (!this.composerModel.projectId) {
      this.composerModel.projectId = this.projectModel.id;
    }
  }

  private async checkJson(): Promise<void> {
    await this.checkPath(FileType.JSON);
    await this.checkAccess(FileType.JSON);
    if (this.composerModel.json.access.readable) {
      await this.checkPackName();
    }
  }

  private async checkLock(): Promise<void> {
    await this.checkPath(FileType.LOCK);
    await this.checkAccess(FileType.LOCK);
  }

  private async checkPackName(): Promise<void> {
    const { name: packName } = await readJson(this.composerModel.json.path);
    this.composerModel.packName = packName;
  }

  private async checkPath(key: FileType): Promise<void> {
    if (!this.composerModel[key]?.path) {
      this.composerModel[key] = {
        ...this.composerModel[key],
        path: joinPath(this.projectModel.rootDirectory.path, `composer.${key}`),
      };
    }
  }

  private async checkAccess(key: FileType): Promise<void> {
    const access = await PathAccessChecker.getPathAccess(
      this.composerModel[key].path
    );
    this.composerModel[key] = {
      ...this.composerModel[key],
      access,
    };
  }
}
