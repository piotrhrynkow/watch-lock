import { Store } from 'redux';
import { mapKeys } from 'lodash';
import AbstractModelService from './abstract-model-service';
import { PackModelType, WatchedPackModelType } from '../../model/orm/types';
import Reference from '../../model/orm/reference';
import { WatchedPack } from '../settings/types';

export default class WatchedPackProcessor extends AbstractModelService {
  private readonly packModels: { [key: string]: PackModelType } = {};

  private readonly watchedPackModels: WatchedPackModelType[] = [];

  public constructor(
    private readonly store: Store,
    packModels: PackModelType[],
    private readonly watchedPacks: WatchedPack[]
  ) {
    super();
    this.packModels = mapKeys(packModels, 'name');
  }

  protected getStore(): Store {
    return this.store;
  }

  public async process(): Promise<WatchedPackModelType[]> {
    await this.checkWatchedPacks();

    return this.watchedPackModels;
  }

  private async checkWatchedPacks(): Promise<void> {
    this.watchedPacks.forEach((watchedPack: WatchedPack) => {
      const packModel: PackModelType =
        this.packModels[watchedPack.name] ?? null;
      const watchedPackModel: WatchedPackModelType = {
        name: watchedPack.name,
        enabled: watchedPack.enabled,
        packId: new Reference(packModel, 'id'),
      };
      this.watchedPackModels.push(watchedPackModel);
    });
  }
}
