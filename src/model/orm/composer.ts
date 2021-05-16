/* eslint-disable default-case */
/* eslint-disable consistent-return */
import { oneToOne, attr } from 'redux-orm';
import { join as joinPath, parse as parsePath } from 'path';
import {
  removeComposerModel,
  setComposerModel,
  updateComposerModel,
  upsertComposerModel,
} from '../../store/actions';
import AbstractModel from './abstract-model';

export default class Composer extends AbstractModel {
  public static modelName = 'Composer';

  public static fields = {
    id: attr(),
    packName: attr(),
    path: attr(),
    directoryPath: attr(),
    filename: attr(),
    access: attr(),
    info: attr(),
    json: attr(),
    lock: attr(),
    projectId: oneToOne({
      to: 'Project',
      as: 'project',
      relatedName: 'composer',
    }),
  };

  public static reducer(
    action: { type: string; payload: any },
    Composer: any,
    session: any
  ) {
    switch (action.type) {
      case setComposerModel.type:
        Composer.injectUUID(session, action);
        Composer.create(action.payload);
        break;
      case updateComposerModel.type:
        Composer.withId(action.payload.id).update(action.payload);
        break;
      case upsertComposerModel.type:
        Composer.injectUUID(session, action);
        Composer.upsert(action.payload);
        break;
      case removeComposerModel.type:
        Composer.withId(action.payload).delete();
        break;
    }
  }

  public static parseFilePath(filePath: string): FilePathInfo {
    const { dir, base } = parsePath(filePath);

    return {
      directoryPath: dir,
      filename: base,
      path: joinPath(dir, base),
    };
  }
}

declare type FilePathInfo = {
  directoryPath: string;
  filename: string;
  path: string;
};
