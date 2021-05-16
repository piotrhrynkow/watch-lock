import { Store } from 'redux';
import { IndexedModelClasses } from 'redux-orm/ORM';
import { OrmSession } from 'redux-orm/Session';
import AbstractModelService from './abstract-model-service';
import { Package } from '../../model/composer-lock';
import { ComposerModelType, PackModelType } from '../../model/orm/types';
import ComposerProcessor from './composer-processor';

export default class PackProcessor extends AbstractModelService {
  private readonly packModels: PackModelType[] = [];

  public constructor(
    private readonly store: Store,
    private readonly composerModel: ComposerModelType
  ) {
    super();
  }

  protected getStore(): Store {
    return this.store;
  }

  public static getByName = (
    session: OrmSession<IndexedModelClasses<any, string | number | symbol>>,
    name: string
  ): PackModelType | null => {
    const { Pack } = session;
    const filteredPack = Pack.all()
      .filter((pack) => pack.name === name)
      .last();

    return filteredPack?.ref ?? null;
  };

  public async process(): Promise<PackModelType[]> {
    const composerPacks: Package[] = await ComposerProcessor.getLockPackages(
      this.composerModel
    );
    await this.checkPacks(composerPacks);

    return this.packModels;
  }

  private async checkPacks(packs: Package[]): Promise<void> {
    packs.forEach((pack: Package) => {
      const packModel: PackModelType = {
        // id: this.generateUUID(),
        name: pack.name,
        sourceUrl: pack.source.url,
      };
      this.packModels.push(packModel);
    });
  }
}
