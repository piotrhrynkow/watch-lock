/* eslint-disable default-case */
/* eslint-disable consistent-return */
import { attr } from 'redux-orm';
import {
  removeProjectModel,
  setProjectModel,
  updateProjectModel,
  upsertProjectModel,
} from '../../store/actions';
import AbstractModel from './abstract-model';

export default class Project extends AbstractModel {
  public static modelName = 'Project';

  public static fields = {
    id: attr(),
    rootDirectory: attr(),
    git: attr(),
  };

  public static reducer(
    action: { type: string; payload: any },
    Project: any,
    session: any
  ) {
    switch (action.type) {
      case setProjectModel.type:
        Project.injectUUID(session, action);
        Project.create(action.payload);
        break;
      case updateProjectModel.type:
        Project.withId(action.payload.id).update(action.payload);
        break;
      case upsertProjectModel.type:
        Project.injectUUID(session, action);
        Project.upsert(action.payload);
        break;
      case removeProjectModel.type:
        Project.withId(action.payload).delete();
        break;
    }
  }
}
