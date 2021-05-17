import React from 'react';
import { connect } from 'react-redux';
import { filter, isString, map, sortBy } from 'lodash';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { selectModelWatchedPacksWithRelations } from '../../store/selectors';
import { State } from '../../store';
import {
  removeWatchedPackModel,
  setUpdatedAtProcessing,
  toggleWatchedPackModel,
} from '../../store/actions';
import CollectionShorter from '../../service/collection-shorter';
import {
  ComposerPackModelType,
  WatchedPackModelType,
} from '../../model/orm/types';

function PackWatchList(props: {
  watchedPacks: { [key: string]: WatchedPackModelType };
  toggleWatchedPackModel: (id: string) => void;
  removeWatchedPackModel: (id: string) => void;
  setUpdatedAtProcessing: () => void;
}) {
  const {
    watchedPacks,
    removeWatchedPackModel,
    setUpdatedAtProcessing,
    toggleWatchedPackModel,
  } = props;

  const getPaths = (composerPacks: ComposerPackModelType[]): string[] => {
    const paths: (string | undefined)[] = map(
      composerPacks,
      (composerPack: ComposerPackModelType) =>
        composerPack.composer.project?.rootDirectory.path
    );

    return filter(paths, (path: string | undefined) =>
      isString(path)
    ) as string[];
  };

  const listProjects = (composerPacks: ComposerPackModelType[]) => {
    const paths: string[] = getPaths(composerPacks);
    if (!paths.length) {
      return <div className="label danger">no projects</div>;
    }
    const shortPaths: string[] = CollectionShorter.short(paths);
    return map(shortPaths.sort(), (path: string, index: number) => (
      <div key={index} className="label">
        {path}
      </div>
    ));
  };

  const sortedWatchedPacks: WatchedPackModelType[] = sortBy(
    watchedPacks,
    (watchedPack: WatchedPackModelType) => watchedPack.name
  );
  const listPacks = map(
    sortedWatchedPacks,
    (watchedPack: WatchedPackModelType) => (
      <div key={watchedPack.id} className="row">
        <div className="name">{watchedPack.name}</div>
        <div className="action">
          <label className="checkbox inline">
            &nbsp;
            <input
              type="checkbox"
              onChange={() => toggleWatchedPackModel(watchedPack.id)}
              defaultChecked={watchedPack.enabled}
            />
            <span className="checkmark" />
          </label>
          <FA
            icon={faTrashAlt}
            className="clickable"
            onClick={() => {
              removeWatchedPackModel(watchedPack.id);
              setUpdatedAtProcessing();
            }}
          />
        </div>
        <div className="project">
          {listProjects(watchedPack.pack.composerPacks)}
        </div>
      </div>
    )
  );

  return (
    <>
      <div className="list pack">{listPacks}</div>
    </>
  );
}

const mapStateToProps = (state: State) => {
  return {
    watchedPacks: selectModelWatchedPacksWithRelations(state),
  };
};
export default connect(mapStateToProps, {
  removeWatchedPackModel,
  setUpdatedAtProcessing,
  toggleWatchedPackModel,
})(PackWatchList);
