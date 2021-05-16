import { Store } from 'redux';
import { mapKeys } from 'lodash';
import { OrmSession } from 'redux-orm/Session';
import { IndexedModelClasses } from 'redux-orm/ORM';
import AbstractModelService from './abstract-model-service';
import { Package } from '../../model/composer-lock';
import {
  ComposerModelType,
  ComposerPackModelType,
  PackModelType,
} from '../../model/orm/types';
import Reference from '../../model/orm/reference';
import ComposerProcessor from './composer-processor';

export default class ComposerPackProcessor extends AbstractModelService {
  private readonly packModels: { [key: string]: PackModelType } = {};

  private readonly composerPackModels: ComposerPackModelType[] = [];

  public constructor(
    private readonly store: Store,
    private readonly composerModel: ComposerModelType,
    packModels: PackModelType[]
  ) {
    super();
    this.packModels = mapKeys(packModels, 'name');
  }

  protected getStore(): Store {
    return this.store;
  }

  public async process(): Promise<ComposerPackModelType[]> {
    const packs: Package[] = await ComposerProcessor.getLockPackages(
      this.composerModel
    );
    await this.checkComposerPacks(packs);

    return this.composerPackModels;
  }

  public static getByComposerIdPackId = (
    session: OrmSession<IndexedModelClasses<any, string | number | symbol>>,
    composerId: string,
    packId: string
  ): ComposerPackModelType | null => {
    const { ComposerPack } = session;
    const filteredComposer = ComposerPack.all()
      .filter(
        (composerPack) =>
          composerPack.composerId === composerId &&
          composerPack.packId === packId
      )
      .last();

    return filteredComposer?.ref ?? null;
  };

  private async checkComposerPacks(packs: Package[]): Promise<void> {
    packs.forEach((pack: Package) => {
      const packModel: PackModelType = this.packModels[pack.name];
      const composerPackModel: ComposerPackModelType = {
        composerId: this.composerModel.id,
        packId: new Reference(packModel, 'id'),
        hash: pack.source.reference,
        time: new Date(pack.time),
      };
      this.composerPackModels.push(composerPackModel);
    });
  }
}
