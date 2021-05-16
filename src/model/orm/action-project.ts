/* eslint-disable default-case */
/* eslint-disable consistent-return */
import { Model, attr, oneToOne } from 'redux-orm';
import {
  removeActionProjectModel,
  setActionProjectModel,
  updateActionProjectModel,
} from '../../store/actions';

export default class ActionProject extends Model {
  public static modelName = 'ActionProject';

  public static fields = {
    id: attr(),
    selected: attr(),
    projectId: oneToOne({
      to: 'Project',
      as: 'project',
      relatedName: 'actionProject',
    }),
  };

  public static reducer(
    action: { type: string; payload: any },
    ActionProject: any,
    session: any
  ) {
    switch (action.type) {
      case setActionProjectModel.type:
        ActionProject.create(action.payload);
        break;
      case updateActionProjectModel.type:
        ActionProject.withId(action.payload.id).update(action.payload);
        break;
      case removeActionProjectModel.type:
        ActionProject.withId(action.payload).delete();
        break;
    }
  }
}
