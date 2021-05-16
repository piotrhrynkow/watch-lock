/* eslint-disable default-case */
/* eslint-disable consistent-return */
import { Model, attr, oneToOne } from 'redux-orm';
import {
  removeActionPackModel,
  setActionPackModel,
  updateActionPackModel,
} from '../../store/actions';

export default class ActionPack extends Model {
  public static modelName = 'ActionPack';

  public static fields = {
    id: attr(),
    hash: attr(),
    packId: oneToOne({
      to: 'Pack',
      as: 'pack',
      relatedName: 'actionPack',
    }),
  };

  public static reducer(
    action: { type: string; payload: any },
    ActionPack: any,
    session: any
  ) {
    switch (action.type) {
      case setActionPackModel.type:
        ActionPack.create(action.payload);
        break;
      case updateActionPackModel.type:
        ActionPack.withId(action.payload.id).update(action.payload);
        break;
      case removeActionPackModel.type:
        ActionPack.withId(action.payload).delete();
        break;
    }
  }
}
