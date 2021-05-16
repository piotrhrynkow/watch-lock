import { Store } from 'redux';
import { readJSON } from 'fs-extra';
import { concat, forEach, mapKeys, unionBy } from 'lodash';
import Config, { Composer, WatchedPack, Project } from './types';
import { PathAccessChecker } from '../path-access-checker';
import {
  addWatchedPackModel,
  setConfigBackup,
  setPackModel,
  setComposerModel,
  setProjectModel,
  setComposerPackModel,
} from '../../store/actions';
import AbstractModelService from '../abstract-model-service';
import {
  ComposerModelType,
  ComposerPackModelType,
  PackModelType,
  ProjectModelType,
  WatchedPackModelType,
} from '../../model/orm/types';
import {
  ComposerPackProcessor,
  ComposerProcessor,
  PackProcessor,
  ProjectProcessor,
  WatchedPackProcessor,
} from '../processor';

export default class ConfigImporter extends AbstractModelService {
  private projects: { [key: string]: ProjectModelType } = {};

  private composers: { [key: string]: ComposerModelType } = {};

  private packs: PackModelType[] = [];

  private composerPacks: ComposerPackModelType[] = [];

  private watchedPacks: WatchedPackModelType[] = [];

  public constructor(private readonly store: Store) {
    super();
  }

  protected getStore(): Store {
    return this.store;
  }

  public async import(configFilepath: string) {
    const data: Config = await ConfigImporter.openConfigFile(configFilepath);
    this.addUUIDs(data.ids);
    await Promise.all([
      this.importBackup(data.config.backup),
      this.importProjectsWithRelated(
        data.projects,
        data.composers,
        data.watchedPacks
      ),
    ]);
  }

  private async importBackup(directoryPath: string | null): Promise<void> {
    if (directoryPath) {
      this.dispatch(
        setConfigBackup({
          directoryPath,
          access: await PathAccessChecker.getPathAccess(directoryPath),
        })
      );
    }
  }

  private async importProjectsWithRelated(
    projects: Project[],
    composers: Composer[],
    watchedPacks: WatchedPack[]
  ): Promise<void> {
    await this.importProjects(projects);
    await this.importComposers(composers);
    await this.initializePacks();
    await Promise.all([
      this.initializeComposerPacks(),
      this.initializeWatchedPacks(watchedPacks),
    ]);

    await this.flush();
  }

  private async flush(): Promise<void> {
    forEach(this.packs, (pack: PackModelType) => {
      this.dispatch(setPackModel(pack));
    });
    forEach(this.composers, (composer: ComposerModelType) => {
      this.dispatch(setComposerModel(composer));
    });
    forEach(this.projects, (project: ProjectModelType) => {
      this.dispatch(setProjectModel(project));
    });
    forEach(this.composerPacks, (composerPack: ComposerPackModelType) => {
      this.dispatch(
        setComposerPackModel({
          ...composerPack,
          packId: composerPack.packId.toString(),
        })
      );
    });
    forEach(this.watchedPacks, (watchedPack: WatchedPackModelType) => {
      this.dispatch(
        addWatchedPackModel({
          ...watchedPack,
          packId: watchedPack.packId?.toString(),
        })
      );
    });
  }

  private async importProjects(projects: Project[]): Promise<void> {
    const processorPromises: Promise<ProjectModelType>[] = [];
    forEach(projects, (projectData: Project) => {
      const projectProcessor = new ProjectProcessor(this.store, {
        id: projectData.id,
        rootDirectory: {
          path: projectData.directory.path,
        },
      });
      processorPromises.push(projectProcessor.process());
    });
    const projectModels: ProjectModelType[] = await Promise.all(
      processorPromises
    );
    this.projects = mapKeys(
      projectModels,
      (projectModel: ProjectModelType) => projectModel.id
    );
  }

  private async importComposers(composers: Composer[]): Promise<void> {
    const composerPromises: Promise<ComposerModelType>[] = [];
    forEach(composers, (composerData: Composer) => {
      const projectModel: ProjectModelType = this.projects[
        composerData.projectId
      ];
      const composerProcessor = new ComposerProcessor(
        this.store,
        {
          id: composerData.id,
          json: {
            path: composerData.jsonPath,
          },
          lock: {
            path: composerData.lockPath,
          },
          projectId: composerData.projectId,
        },
        projectModel
      );
      composerPromises.push(composerProcessor.process());
    });
    const composerModels: ComposerModelType[] = await Promise.all(
      composerPromises
    );
    this.composers = mapKeys(
      composerModels,
      (composerModel: ComposerModelType) => composerModel.id
    );
  }

  private async initializePacks(): Promise<void> {
    const packPromises: Promise<PackModelType[]>[] = [];
    forEach(this.composers, (composer: ComposerModelType) => {
      const packProcessor = new PackProcessor(this.store, composer);
      packPromises.push(packProcessor.process());
    });
    const composerPackModelGroups: PackModelType[][] = await Promise.all(
      packPromises
    );
    const uniquePackModels: PackModelType[] = unionBy(
      ...composerPackModelGroups,
      'name'
    );
    this.packs = uniquePackModels;
  }

  private async initializeComposerPacks(): Promise<void> {
    const composerPackPromises: Promise<ComposerPackModelType[]>[] = [];
    forEach(this.composers, (composer: ComposerModelType) => {
      const composerPackProcessor = new ComposerPackProcessor(
        this.store,
        composer,
        this.packs
      );
      composerPackPromises.push(composerPackProcessor.process());
    });
    const composerPackModelGroups: ComposerPackModelType[][] = await Promise.all(
      composerPackPromises
    );
    this.composerPacks = concat(...composerPackModelGroups);
  }

  private async initializeWatchedPacks(
    watchedPacks: WatchedPack[]
  ): Promise<void> {
    const watchedPackProcessor = new WatchedPackProcessor(
      this.store,
      this.packs,
      watchedPacks
    );
    this.watchedPacks = await watchedPackProcessor.process();
  }

  private static async openConfigFile(filePath: string): Promise<Config> {
    const access = await PathAccessChecker.getPathAccess(filePath);
    if (!access.exists) {
      throw Error(`File "${filePath}" not exists`);
    }
    if (!access.readable) {
      throw Error(`Unable to open "${filePath}" file`);
    }

    return readJSON(filePath);
  }
}
