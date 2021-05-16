/* eslint-disable default-case */
/* eslint-disable consistent-return */
import { attr, oneToOne } from 'redux-orm';
import {
  addWatchedPackModel,
  removeWatchedPackModel,
  toggleWatchedPackModel,
  watchPackModel,
} from '../../store/actions';
import AbstractModel from './abstract-model';
import { PackModelType } from './types';

export default class WatchedPack extends AbstractModel {
  public static modelName = 'WatchedPack';

  public static fields = {
    id: attr(),
    name: attr(),
    enabled: attr(),
    packId: oneToOne({
      to: 'Pack',
      as: 'pack',
      relatedName: 'watchedPack',
    }),
  };

  public static reducer(
    action: { type: string; payload: any },
    PackWatched: any,
    session: any
  ) {
    let packWatched;
    switch (action.type) {
      case addWatchedPackModel.type:
        PackWatched.injectUUID(session, action);
        PackWatched.create(action.payload);
        break;
      case removeWatchedPackModel.type:
        PackWatched.withId(action.payload).delete();
        break;
      case toggleWatchedPackModel.type:
        packWatched = PackWatched.withId(action.payload);
        packWatched.update({
          enabled: !packWatched.enabled,
        });
        break;
      case watchPackModel.type:
        PackWatched.create({
          ...action.payload,
          name: session.Pack.withId(action.payload.packId).name,
        });
        break;
    }
  }
}

export interface WatchedPackModelType {
  id: string;
  name: string;
  enabled: boolean;
  packId: string | null;
  pack: PackModelType;
}
