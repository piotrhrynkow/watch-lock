import { size } from 'lodash';
import { createSelector as createModelSelector } from 'redux-orm';
import { State } from './index';
import orm from './reducers/orm';

export const selectUpdatedAtProcessing = (state: State) => state.processing.updatedAt;

export const selectIsProcessing = (state: State) => size(state.processing.processing.projects) > 0;

export const selectModelProjects = createModelSelector(orm, orm.Project);

export const selectModelComposers = createModelSelector(orm, orm.Composer);

export const selectModelWatchedPacks = createModelSelector(orm, orm.WatchedPack);

export const selectModelProjectsWithRelations = createModelSelector(
  orm,
  (session) => {
    return session.Project.all()
      .toModelArray()
      .map((project) => ({
        ...project.ref,
        composer: {
          ...project.composer.ref,
          composerPacks: project.composer.composerPacks
            .all()
            .toModelArray()
            .map((composerPack) => ({
              ...composerPack.ref,
              pack: composerPack.pack.ref,
              actionComposerPack: composerPack.actionComposerPack?.ref,
            })),
        },
        actionProject: project.actionProject?.ref,
      }));
  }
);

export const selectModelWatchedPacksWithRelations = createModelSelector(
  orm,
  (session) => {
    return session.WatchedPack.all()
      .toModelArray()
      .map((watchedPack) => ({
        ...watchedPack.ref,
        pack: {
          ...watchedPack.pack.ref,
          composerPacks: watchedPack.pack.composerPacks
            .all()
            .toModelArray()
            .map((composerPack) => ({
              ...composerPack.ref,
              composer: {
                ...composerPack.composer.ref,
                project: composerPack.composer.project?.ref,
              },
              actionComposerPack: composerPack.actionComposerPack?.ref,
            })),
        },
      }));
  }
);

export const selectModelUnwatchedPacks = createModelSelector(orm, (session) => {
  return session.Pack.all()
    .toModelArray()
    .filter(
      (pack) =>
        (!pack.watchedPack || !pack.watchedPack.enabled) &&
        pack.composerPacks.count()
    )
    .map((pack) => pack.ref);
});

export const selectModelPacksWatched = createModelSelector(orm, (session) => {
  return session.WatchedPack.all()
    .toModelArray()
    .filter((watchedPack) => watchedPack.enabled)
    .map((watchedPack) => ({
      ...watchedPack.pack.ref,
      actionPack: watchedPack.pack.actionPack?.ref,
      composerPacks: watchedPack.pack.composerPacks
        .all()
        .toModelArray()
        .map((composerPack) => ({
          ...composerPack.ref,
          composer: {
            ...composerPack.composer.ref,
            project: {
              ...composerPack.composer.project?.ref,
              actionProject: composerPack.composer.project?.actionProject?.ref,
            },
          },
          pack: {
            ...watchedPack.pack.ref,
            actionPack: watchedPack.pack.actionPack?.ref,
          },
          actionComposerPack: composerPack.actionComposerPack?.ref,
        })),
    }));
});
