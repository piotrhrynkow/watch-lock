/* eslint-disable default-case */
/* eslint-disable consistent-return */
import { Model, attr } from 'redux-orm';
import { addUUIDModel } from '../../store/actions';

export default class UUID extends Model {
  public static modelName = 'UUID';

  public static fields = {
    id: attr(),
  };

  public static reducer(
    action: { type: string; payload: any },
    UUID: any,
    session: any
  ) {
    switch (action.type) {
      case addUUIDModel.type:
        UUID.create(action.payload);
        break;
    }
  }
}
