/* eslint-disable prettier/prettier */
import { createAction } from '@reduxjs/toolkit';
import Log from '../../model/log';
import { Token } from '../../service/settings/types';
import {
  ActionComposerPackModelType,
  ActionPackModelType,
  ActionProjectModelType,
  ComposerModelType,
  ComposerPackModelType,
  PackModelType,
  ProjectModelType,
  UUIDModelType,
  WatchedPackModelType
} from '../../model/orm/types';
import { LockUpdated } from '../../model/types';
import { ConfigBackup } from '../types';

export const addUUID = createAction<string>('uuid/add');

export const addUUIDs = createAction<string[]>('uuid/add/multiple');

export const addUUIDModel = createAction<UUIDModelType>('uuid-model/add');

export const setConfigFile = createAction<string>('config/file/set');

export const setConfigBackup = createAction<ConfigBackup>('config/backup/set');

export const setConfigVersion = createAction<string>('config/version/set');

export const removeConfigBackup = createAction<void>('config/backup/remove');

export const addToken = createAction<Token>('token/add');

export const removeToken = createAction<string>('token/remove');

export const addLog = createAction<Log>('log/add');

export const removeLog = createAction<number>('log/remove');

export const addLockUpdated = createAction<LockUpdated>('lock-updated/add');

export const setUpdatedAtProcessing = createAction<void>('processing/updated-at');

export const addProjectProcessing = createAction<string>('processing/add/project');

export const removeProjectProcessing = createAction<string>('processing/remove/project');

export const setComposerModel = createAction<ComposerModelType>('composer-model/set');

export const updateComposerModel = createAction<ComposerModelType>('composer-model/update');

export const upsertComposerModel = createAction<ComposerModelType>('composer-model/upsert');

export const removeComposerModel = createAction<string>('composer-model/remove');

export const setComposerPackModel = createAction<ComposerPackModelType>('composer-pack-model/set');

export const updateComposerPackModel = createAction<ComposerPackModelType>('composer-pack-model/update');

export const upsertComposerPackModel = createAction<ComposerPackModelType>('composer-pack-model/upsert');

export const removeComposerPackModel = createAction<string>('composer-pack-model/remove');

export const setPackModel = createAction<PackModelType>('pack-model/set');

export const upsertPackModel = createAction<PackModelType>('pack-model/upsert');

export const addWatchedPackModel = createAction<WatchedPackModelType>('watched-pack-model/add');

export const removeWatchedPackModel = createAction<string>('watched-pack-model/remove');

export const toggleWatchedPackModel = createAction<string>('watched-pack-model/toggle');

export const watchPackModel = createAction<string>('watched-pack-model/watch');

export const setProjectModel = createAction<ProjectModelType>('project-model/set');

export const updateProjectModel = createAction<ProjectModelType>('project-model/update');

export const upsertProjectModel = createAction<ProjectModelType>('project-model/upsert');

export const removeProjectModel = createAction<string>('project-model/remove');

export const setActionPackModel = createAction<ActionPackModelType>('action-pack-model/set');

export const updateActionPackModel = createAction<ActionPackModelType>('action-pack-model/update');

export const removeActionPackModel = createAction<string>('action-pack-model/remove');

export const setActionComposerPackModel = createAction<ActionComposerPackModelType>('action-composer-pack-model/set');

export const updateActionComposerPackModel = createAction<ActionComposerPackModelType>('action-composer-pack-model/update');

export const deselectActionComposerPackModel = createAction<string>('action-composer-pack-model/deselect');

export const removeActionComposerPackModel = createAction<string>('action-composer-pack-model/remove');

export const setActionProjectModel = createAction<ActionProjectModelType>('action-project-model/set');

export const updateActionProjectModel = createAction<ActionProjectModelType>('action-project-model/update');

export const removeActionProjectModel = createAction<string>('action-project-model/remove');

export const selectComposerPackToActionPackModel = createAction<string>('action-pack-model/composer-pack/add');

export const unselectComposerPackFromActionPackModel = createAction<string>('action-pack-model/composer-pack/remove');
