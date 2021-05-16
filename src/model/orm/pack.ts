/* eslint-disable default-case */
/* eslint-disable consistent-return */
import { attr } from 'redux-orm';
import { setPackModel, upsertPackModel } from '../../store/actions';
import AbstractModel from './abstract-model';
import { ActionPackModelType, ComposerPackModelType } from './types';

export default class Pack extends AbstractModel {
  public static modelName = 'Pack';

  public static fields = {
    id: attr(),
    name: attr(),
    sourceUrl: attr(),
  };

  public static reducer(
    action: { type: string; payload: any },
    Pack: any,
    session: any
  ) {
    switch (action.type) {
      case setPackModel.type:
        Pack.injectUUID(session, action);
        Pack.create(action.payload);
        break;
      case upsertPackModel.type:
        Pack.injectUUID(session, action);
        Pack.upsert(action.payload);
        break;
    }
  }
}

export interface PackModelType {
  id: string;
  name: string;
  sourceUrl: string;
  composerPacks: ComposerPackModelType[];
  actionPack: ActionPackModelType | null;
}
