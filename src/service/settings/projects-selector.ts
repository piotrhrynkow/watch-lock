import { Store } from 'redux';
import { concat, map, unionBy } from 'lodash';
import {
  upsertPackModel,
  addProjectProcessing,
  removeProjectProcessing,
  upsertComposerModel,
  upsertProjectModel,
  upsertComposerPackModel,
} from '../../store/actions';
import AbstractModelService from '../abstract-model-service';
import {
  ComposerModelType,
  ComposerPackModelType,
  PackModelType,
  ProjectModelType,
} from '../../model/orm/types';
import {
  ComposerPackProcessor,
  ComposerProcessor,
  PackProcessor,
  ProjectProcessor,
} from '../processor';
import Reference from '../../model/orm/reference';

export default class ProjectsSelector extends AbstractModelService {
  private projects: ProjectModelType[] = [];

  private composers: ComposerModelType[] = [];

  private packs: PackModelType[] = [];

  private composerPacks: ComposerPackModelType[] = [];

  public constructor(
    private readonly store: Store,
    private readonly directoryPaths: string[]
  ) {
    super();
  }

  protected getStore(): Store {
    return this.store;
  }

  public async process(): Promise<void> {
    this.dispatch(addProjectProcessing('selecting'));

    await this.checkProjects();
    await this.checkComposers();
    await this.checkPacks();
    await this.checkComposerPacks();

    this.flush();
    this.dispatch(removeProjectProcessing('selecting'));
  }

  private async flush(): Promise<void> {
    this.packs.forEach((pack: PackModelType) => {
      this.dispatch(upsertPackModel(pack));
    });
    this.composers.forEach((composer: ComposerModelType) => {
      this.dispatch(upsertComposerModel(composer));
    });
    this.projects.forEach((project: ProjectModelType) => {
      this.dispatch(upsertProjectModel(project));
    });
    this.composerPacks.forEach((composerPack: ComposerPackModelType) => {
      this.dispatch(
        upsertComposerPackModel({
          ...composerPack,
          packId: composerPack.packId.toString(),
        })
      );
    });
  }

  private async checkProjects(): Promise<void> {
    const promises: Promise<ProjectModelType>[] = [];
    this.directoryPaths.forEach((directoryPath: string) => {
      promises.push(this.checkProjectByDirectoryPath(directoryPath));
    });
    this.projects = await Promise.all(promises);
  }

  private async checkProjectByDirectoryPath(
    directoryPath: string
  ): Promise<ProjectModelType> {
    let project: ProjectModelType | null = ProjectProcessor.getByDirectoryPath(
      this.getModelSession(),
      directoryPath
    );
    if (!project) {
      project = {
        rootDirectory: {
          path: directoryPath,
        },
      } as ProjectModelType;
    }
    const projectProcessor = new ProjectProcessor(this.store, project);

    return projectProcessor.process();
  }

  private async checkComposers(): Promise<void> {
    const promises: Promise<ComposerModelType>[] = [];
    this.projects.forEach((project: ProjectModelType) => {
      promises.push(this.checkComposerByProject(project));
    });
    this.composers = await Promise.all(promises);
  }

  private async checkComposerByProject(
    project: ProjectModelType
  ): Promise<ComposerModelType> {
    let composer: ComposerModelType | null = ComposerProcessor.getByProjectId(
      this.getModelSession(),
      project.id
    );
    if (!composer) {
      composer = {} as ComposerModelType;
    }
    const composerProcessor = new ComposerProcessor(
      this.store,
      composer,
      project
    );

    return composerProcessor.process();
  }

  private async checkPacks(): Promise<void> {
    const promises: Promise<PackModelType[]>[] = [];
    this.composers.forEach((composer: ComposerModelType) => {
      promises.push(this.checkPacksByComposer(composer));
    });
    const packsByComposer: PackModelType[][] = await Promise.all(promises);
    this.packs = unionBy<PackModelType>(...packsByComposer, 'name');
  }

  private async checkPacksByComposer(
    composer: ComposerModelType
  ): Promise<PackModelType[]> {
    const packProcessor = new PackProcessor(this.store, composer);
    const packs: PackModelType[] = await packProcessor.process();

    return map(
      packs,
      (pack: PackModelType) =>
        PackProcessor.getByName(this.getModelSession(), pack.name) ?? pack
    );
  }

  private async checkComposerPacks(): Promise<void> {
    const promises: Promise<ComposerPackModelType[]>[] = [];
    this.composers.forEach((composer: ComposerModelType) => {
      promises.push(this.checkComposerPacksByComposer(composer));
    });
    const composerPacksByComposer: ComposerPackModelType[][] = await Promise.all(
      promises
    );
    this.composerPacks = concat<ComposerPackModelType>(
      ...composerPacksByComposer
    );
  }

  private async checkComposerPacksByComposer(
    composer: ComposerModelType
  ): Promise<ComposerPackModelType[]> {
    const composerPackProcessor = new ComposerPackProcessor(
      this.store,
      composer,
      this.packs
    );
    const composerPacks: ComposerPackModelType[] = await composerPackProcessor.process();

    return map(composerPacks, (composerPack: ComposerPackModelType) => {
      const composerId = Reference.getObjectId(composerPack.composerId);
      const packId = Reference.getObjectId(composerPack.packId);
      if (composerId && packId) {
        const composerPackFound: ComposerPackModelType | null = ComposerPackProcessor.getByComposerIdPackId(
          this.getModelSession(),
          composerId,
          packId
        );
        if (composerPackFound) {
          return {
            ...composerPackFound,
            hash: composerPack.hash,
            time: composerPack.time,
          };
        }
      }

      return composerPack;
    });
  }

  private async checkWatchedPacks(): Promise<void> {
    // TODO?
  }
}
