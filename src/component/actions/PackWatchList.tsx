import { shell } from 'electron';
import React, { useEffect, useRef, useState } from 'react';
import { connect, useStore } from 'react-redux';
import { debounce, filter, isString, map, sortBy } from 'lodash';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faCube,
  faFileDownload,
  faFolderOpen,
  faHashtag,
} from '@fortawesome/free-solid-svg-icons';
import { faGit, faGithubAlt } from '@fortawesome/free-brands-svg-icons';
import ReactTooltip from 'react-tooltip';
import { Store } from 'redux';
import classnames from 'classnames';
import simpleGit, { SimpleGit } from 'simple-git';
import { useHistory } from 'react-router-dom';
import { copyFile } from 'fs-extra';
import dayjs from 'dayjs';
import {
  selectModelPacksWatched,
  selectModelProjectsWithRelations,
} from '../../store/selectors';
import {
  addLockUpdated,
  addLog,
  deselectActionComposerPackModel,
  setActionComposerPackModel,
  setActionPackModel,
  setActionProjectModel,
  updateActionComposerPackModel,
  updateActionPackModel,
  updateActionProjectModel,
} from '../../store/actions';
import CollectionShorter, {
  ShortMapCollection,
} from '../../service/collection-shorter';
import UUIDProvider from '../../service/uuid-provider';
import {
  ActionComposerPackModelType,
  ActionPackModelType,
  ActionProjectModelType,
  ComposerPackModelType,
  PackModelType,
  ProjectModelType,
} from '../../model/orm/types';
import GitHelper from '../../service/git-helper';
import Log from '../../model/log';
import JsonWriter, { WriterResult } from '../../service/json-writer';
import { LockDiff, LockUpdated } from '../../model/types';
import ProjectsSelector from '../../service/settings/projects-selector';
import { ConfigBackup, State } from '../../store/types';
import Backup from '../../service/backup';

function PackWatchList(props: {
  backup: ConfigBackup | null;
  packs: PackModelType[];
  projects: ProjectModelType[];
  addLockUpdated: (payload: LockUpdated) => void;
  addLog: (payload: Log) => void;
  deselectActionComposerPackModel: (payload: string) => void;
  setActionComposerPackModel: (payload: ActionComposerPackModelType) => void;
  setActionPackModel: (payload: ActionPackModelType) => void;
  setActionProjectModel: (payload: ActionProjectModelType) => void;
  updateActionComposerPackModel: (payload: ActionComposerPackModelType) => void;
  updateActionPackModel: (payload: ActionPackModelType) => void;
  updateActionProjectModel: (payload: ActionProjectModelType) => void;
}) {
  const store: Store = useStore();
  const history = useHistory();
  const {
    backup,
    packs,
    projects,
    addLockUpdated,
    addLog,
    deselectActionComposerPackModel,
    setActionComposerPackModel,
    setActionPackModel,
    setActionProjectModel,
    updateActionComposerPackModel,
    updateActionPackModel,
    updateActionProjectModel,
  } = props;

  const hashInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [hasGit, setHasGit] = useState<{ [key: string]: boolean }>({});

  const getGitPathByPackName = (packName: string): string | null => {
    const filteredProjects: ProjectModelType[] = projects.filter(
      (project: ProjectModelType) =>
        project.composer.packName === packName && project.git.hasRepo
    );
    if (filteredProjects.length === 1) {
      const project: ProjectModelType = filteredProjects.pop() as ProjectModelType;

      return project.git.path;
    }

    return null;
  };

  useEffect(() => {
    const gitList: { [key: string]: boolean } = {};
    packs.forEach((pack: PackModelType) => {
      gitList[pack.id] = getGitPathByPackName(pack.name) !== null;
    });
    setHasGit(gitList);
  }, packs);

  const setActionComposerPack = (
    composerPack: ComposerPackModelType,
    data: Partial<ActionComposerPackModelType>
  ) => {
    if (composerPack.actionComposerPack) {
      updateActionComposerPackModel({
        ...composerPack.actionComposerPack,
        ...data,
      });
    } else {
      setActionComposerPackModel({
        ...data,
        composerPackId: composerPack.id,
      } as ActionComposerPackModelType);
    }
  };

  const setActionPack = (
    pack: PackModelType,
    data: Partial<ActionPackModelType>
  ) => {
    if (pack.actionPack) {
      updateActionPackModel({
        ...pack.actionPack,
        ...data,
      });
    } else {
      setActionPackModel({
        id: UUIDProvider.getStoreUUID(store),
        ...data,
        packId: pack.id,
      } as ActionPackModelType);
    }
  };

  const setActionProject = (
    project: ProjectModelType,
    data: Partial<ActionProjectModelType>
  ) => {
    if (project.actionProject) {
      updateActionProjectModel({
        ...project.actionProject,
        ...data,
      });
    } else {
      setActionProjectModel({
        id: UUIDProvider.getStoreUUID(store),
        ...data,
        projectId: project.id,
      } as ActionProjectModelType);
    }
  };

  const setHash = (hash: string, pack: PackModelType) => {
    setActionPack(pack, { hash });
  };

  const onChangeHash = debounce(setHash, 500);

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

  const getHashLabelColor = (composerPack: ComposerPackModelType): string => {
    const selectedHash = composerPack.pack.actionPack?.hash;
    const hashSelected: boolean = Boolean(selectedHash);
    const hashEqual: boolean = composerPack.hash === selectedHash;
    const classes: { [key: string]: boolean } = {
      'color-success': hashSelected && hashEqual,
      'color-danger': hashSelected && !hashEqual,
    };

    return classnames(classes);
  };

  const toggleComposerPackSelection = (
    composerPack: ComposerPackModelType
  ): void => {
    setActionComposerPack(composerPack, {
      selected: !composerPack.actionComposerPack?.selected,
    });
  };

  const getHashValue = (pack: PackModelType): string => {
    return pack.actionPack?.hash ?? '';
  };

  const getLastCommitHash = async (gitPath: string): Promise<string | null> => {
    const git: SimpleGit = simpleGit(gitPath);
    const logResult = await git.log({ maxCount: 1 });

    return logResult.latest?.hash ?? null;
  };

  const setInputHash = (pack: PackModelType, hash: string): void => {
    const hashInput: HTMLInputElement | null = hashInputRefs.current[pack.id];
    if (hashInput) {
      hashInput.value = hash;
      setHash(hash, pack);
    }
  };

  const addLastLocalHash = async (pack: PackModelType): Promise<void> => {
    const gitPath: string | null = getGitPathByPackName(pack.name);
    if (gitPath) {
      const hash: string | null = await getLastCommitHash(gitPath);
      if (hash) {
        setInputHash(pack, hash);
      }
    }
  };

  const addLastRemoteHash = async (pack: PackModelType): Promise<void> => {
    const gitPath: string | null = getGitPathByPackName(pack.name);
    if (gitPath) {
      try {
        const git = new GitHelper(gitPath);
        const currentBranch = await git.getCurrentBranch();
        if (currentBranch) {
          const hash: string | null = await git.getRemoteHash(currentBranch);
          if (hash) {
            setInputHash(pack, hash);
          }
        }
      } catch (error) {
        addLog({
          id: UUIDProvider.getStoreUUID(store),
          message: error.message,
        });
      }
    }
  };

  const getSelectedComposerPacksByPack = (
    pack: PackModelType
  ): ComposerPackModelType[] => {
    return pack.composerPacks.filter(
      (composerPack: ComposerPackModelType) =>
        composerPack.actionComposerPack?.selected
    );
  };

  const isComposersForPackUpdatable = (pack: PackModelType): boolean => { // check also if hashes are different?
    return Boolean(
      getSelectedComposerPacksByPack(pack).length && pack.actionPack?.hash
    );
  };

  const handleRepositoryUrl = (url: string): string => {
    const gitAtFound = url.match(/^git@([^:]+):([^/]+\/[^.]+)\.git$/);
    if (gitAtFound) {
      const [data, host, packageName] = gitAtFound;
      return `https://${host}/${packageName}`;
    }
    const gitEndFound = url.match(/^(.+)\.git$/);
    if (gitEndFound) {
      const [data, url] = gitEndFound;
      return url;
    }

    return url;
  };

  const deselectComposerPacks = (
    composerPacks: ComposerPackModelType[]
  ): void => {
    composerPacks.forEach((composerPack: ComposerPackModelType) => {
      deselectActionComposerPackModel(composerPack.actionComposerPack.id);
    });
  };

  const refreshProjects = async (directoryPaths: string[]): Promise<void> => {
    const projectsSelector = new ProjectsSelector(store, directoryPaths);
    await projectsSelector.process();
  };

  const backupLocks = async (
    composerPacks: ComposerPackModelType[]
  ): Promise<void> => {
    if (backup?.directoryPath) {
      if (!backup.access.writable) {
        addLog({
          id: UUIDProvider.getStoreUUID(store),
          message: `Cannot save backup to ${backup.directoryPath}, missing writing access`,
        });
      } else {
        const promises: Promise<void>[] = [];
        composerPacks.forEach((composerPack: ComposerPackModelType) => {
          promises.push(
            copyFile(
              composerPack.composer.lock.path,
              Backup.getFilePath(backup.directoryPath, composerPack.composer)
            )
          );
        });
        await Promise.all(promises);
      }
    }
  };

  const saveComposerFile = async (pack: PackModelType): Promise<void> => {
    if (pack.actionPack?.hash) {
      const composerPacks: ComposerPackModelType[] = getSelectedComposerPacksByPack(
        pack
      );
      await backupLocks(composerPacks);
      const jsonWriter = new JsonWriter();
      const writerPromises: Promise<WriterResult>[] = [];
      composerPacks.forEach((composerPack: ComposerPackModelType) => {
        writerPromises.push(
          jsonWriter.saveFromFile(composerPack.composer.lock.path, {
            [composerPack.pack.name as string]: pack.actionPack?.hash as string,
          })
        );
      });
      const writerResults = await Promise.all(writerPromises);
      const lockDiffs: LockDiff[] = [];
      writerResults.forEach((result: WriterResult) => {
        lockDiffs.push({
          path: result.filePath,
          diffHtml: result.diffHtml,
        });
      });
      const uuid = UUIDProvider.getStoreUUID(store);
      addLockUpdated({
        id: uuid,
        lockDiffs,
      });
      history.push(`/actions/lock-diff/${uuid}`);
      await refreshProjects(
        composerPacks.map(
          (composerPack: ComposerPackModelType) =>
            composerPack.composer.project.rootDirectory.path
        )
      );
      deselectComposerPacks(composerPacks);
    }
  };

  const listProjects = (composerPacks: ComposerPackModelType[]) => {
    const shortPaths: ShortMapCollection = CollectionShorter.shortMap(
      getPaths(composerPacks)
    );
    const sortedComposerPacks: ComposerPackModelType[] = sortBy(
      composerPacks,
      (composerPack: ComposerPackModelType) =>
        composerPack.composer.project.rootDirectory.path
    );

    return map(sortedComposerPacks, (composerPack: ComposerPackModelType) => (
      <div className="row linked" key={composerPack.composer.project?.id}>
        <p>
          <label className="checkbox">
            &nbsp;
            <input
              type="checkbox"
              onChange={() => toggleComposerPackSelection(composerPack)}
              defaultChecked={composerPack.actionComposerPack?.selected}
            />
            <span className="checkmark" />
          </label>
        </p>
        <p
          className="clickable"
          data-tip={`Open ${composerPack.composer.project?.rootDirectory.path}`}
          onClick={() =>
            shell.showItemInFolder(
              composerPack.composer.project?.rootDirectory.path as string
            )
          }
        >
          <FA icon={faFolderOpen} />{' '}
          {
            shortPaths[
              composerPack.composer.project?.rootDirectory.path as string
            ]
          }
        </p>
        <p
          className={getHashLabelColor(composerPack)}
          data-tip={composerPack.hash}
        >
          <FA icon={faHashtag} /> {composerPack.hash.substring(0, 7)}
        </p>
        {composerPack.time && (
          <p>
            <FA icon={faClock} />{' '}
            {dayjs(composerPack.time).format('YYYY/MM/DD - HH:mm:ss')}
          </p>
        )}
      </div>
    ));
  };

  const sortedPacks = sortBy(packs, (pack: PackModelType) => pack.name);
  const listPacks = map(sortedPacks, (pack: PackModelType) => (
    <div key={pack.id}>
      <div className="row">
        <div className="name">
          <span
            className="clickable"
            data-tip="Go to repository"
            onClick={() =>
              shell.openExternal(handleRepositoryUrl(pack.sourceUrl))
            }
          >
            <FA icon={faCube} /> {pack.name}
          </span>
        </div>
        <div className="hash">
          <input
            type="text"
            placeholder="Commit hash..."
            defaultValue={getHashValue(pack)}
            onChange={(event) => onChangeHash(event.target.value, pack)}
            ref={(element: HTMLInputElement) => {
              hashInputRefs.current[pack.id] = element;
            }}
          />
        </div>
        <div className="action">
          {hasGit[pack.id] && (
            <FA
              icon={faGit}
              className="clickable"
              onClick={() => addLastLocalHash(pack)}
              data-tip="Get last commit from local"
            />
          )}{' '}
          {hasGit[pack.id] && (
            <FA
              icon={faGithubAlt}
              className="clickable"
              onClick={() => addLastRemoteHash(pack)}
              data-tip="Get last commit from remote"
            />
          )}{' '}
          {isComposersForPackUpdatable(pack) && (
            <FA
              icon={faFileDownload}
              className="clickable"
              onClick={() => saveComposerFile(pack)}
              data-tip="Save to lock file"
            />
          )}
        </div>
      </div>
      {listProjects(pack.composerPacks)}
    </div>
  ));

  return (
    <>
      <div className="list pack main">{listPacks}</div>
      <ReactTooltip />
    </>
  );
}

const mapStateToProps = (state: State) => {
  return {
    backup: state.config.backup,
    packs: selectModelPacksWatched(state),
    projects: selectModelProjectsWithRelations(state),
  };
};
export default connect(mapStateToProps, {
  addLockUpdated,
  addLog,
  deselectActionComposerPackModel,
  setActionComposerPackModel,
  setActionPackModel,
  setActionProjectModel,
  updateActionComposerPackModel,
  updateActionPackModel,
  updateActionProjectModel,
})(PackWatchList);
