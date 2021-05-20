import React from 'react';
import { useStore } from 'react-redux';
import { map } from 'lodash';
import { outputJson } from 'fs-extra';
import Token from '../model/token';
import {
  selectModelComposers,
  selectModelProjects,
  selectModelWatchedPacks,
} from '../store/selectors';
import {
  ComposerModelType,
  ProjectModelType,
  WatchedPackModelType,
} from '../model/orm/types';
import { State } from '../store/types';
import SaveDialog from '../service/save-dialog';
import { setConfigFile } from '../store/actions';

function StoreExport(props: { children: any; className?: string|null }) {
  const reservedIds: string[] = [];

  const store = useStore();

  const reserveId = (id: string | null): string | null => {
    if (id !== null && !reservedIds.includes(id)) {
      reservedIds.push(id);
    }

    return id;
  };

  const exportStore = async () => {
    const state: State = store.getState();
    let { filePath } = state.config;
    if (!filePath) {
      filePath = await SaveDialog.showSaveConfigDialog();
      if (filePath) {
        store.dispatch(setConfigFile(filePath));
      }
    }
    if (filePath) {
      const projects: ProjectModelType[] = selectModelProjects(state);
      const composers: ComposerModelType[] = selectModelComposers(state);
      const watchedPacks: WatchedPackModelType[] = selectModelWatchedPacks(state);
      const output: any = {
        config: {
          backup: state.config.backup?.directoryPath,
        },
        tokens: map(state.token.items, (token: Token) => ({
          id: reserveId(token.id),
          name: token.name,
          hash: token.hash,
        })),
        projects: projects.map((project: ProjectModelType) => ({
          id: reserveId(project.id),
          directory: {
            path: project.rootDirectory.path,
          },
        })),
        composers: composers.map((composer: ComposerModelType) => ({
          id: reserveId(composer.id),
          jsonPath: composer.json.path,
          lockPath: composer.lock.path,
          projectId: reserveId(composer.projectId),
        })),
        watchedPacks: watchedPacks.map((watchedPack: WatchedPackModelType) => ({
          name: watchedPack.name,
          enabled: watchedPack.enabled,
          packId: reserveId(watchedPack.packId),
        })),
        ids: reservedIds,
      };
      await outputJson(filePath, output);
    }
  };

  return (
    <>
      <div className={props.className} onClick={exportStore}>
        {props.children}
      </div>
    </>
  );
}

export default StoreExport;
