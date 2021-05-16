/* eslint-disable default-case */
/* eslint-disable consistent-return */
import { attr, fk as oneToMany } from 'redux-orm';
import {
  removeComposerPackModel,
  setComposerPackModel,
  updateComposerPackModel,
  upsertComposerPackModel,
} from '../../store/actions';
import AbstractModel from './abstract-model';

export default class ComposerPack extends AbstractModel {
  public static modelName = 'ComposerPack';

  public static fields = {
    id: attr(),
    hash: attr(),
    time: attr(),
    composerId: oneToMany({
      to: 'Composer',
      as: 'composer',
      relatedName: 'composerPacks',
    }),
    packId: oneToMany({
      to: 'Pack',
      as: 'pack',
      relatedName: 'composerPacks',
    }),
  };

  public static reducer(
    action: { type: string; payload: any },
    ComposerPack: any,
    session: any
  ) {
    switch (action.type) {
      case setComposerPackModel.type:
        ComposerPack.injectUUID(session, action);
        ComposerPack.create(action.payload);
        break;
      case updateComposerPackModel.type:
        ComposerPack.withId(action.payload.id).update(action.payload);
        break;
      case upsertComposerPackModel.type:
        ComposerPack.injectUUID(session, action);
        ComposerPack.upsert(action.payload);
        break;
      case removeComposerPackModel.type:
        ComposerPack.withId(action.payload).delete();
        break;
    }
  }
}
