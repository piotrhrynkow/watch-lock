/* eslint-disable default-case */
/* eslint-disable consistent-return */
import { attr, oneToOne } from 'redux-orm';
import {
  deselectActionComposerPackModel,
  removeActionComposerPackModel,
  setActionComposerPackModel,
  updateActionComposerPackModel,
} from '../../store/actions';
import AbstractModel from './abstract-model';

export default class ActionComposerPack extends AbstractModel {
  public static modelName = 'ActionComposerPack';

  public static fields = {
    id: attr(),
    selected: attr(),
    composerPackId: oneToOne({
      to: 'ComposerPack',
      as: 'composerPack',
      relatedName: 'actionComposerPack',
    }),
  };

  public static reducer(
    action: { type: string; payload: any },
    ActionComposerPack: any,
    session: any
  ) {
    let actionComposerPack;
    switch (action.type) {
      case setActionComposerPackModel.type:
        ActionComposerPack.injectUUID(session, action);
        ActionComposerPack.create(action.payload);
        break;
      case updateActionComposerPackModel.type:
        ActionComposerPack.withId(action.payload.id).update(action.payload);
        break;
      case removeActionComposerPackModel.type:
        ActionComposerPack.withId(action.payload).delete();
        break;
      case deselectActionComposerPackModel.type:
        actionComposerPack = ActionComposerPack.withId(action.payload);
        actionComposerPack.update({
          ...actionComposerPack.ref,
          selected: false,
        });
        break;
    }
  }
}
