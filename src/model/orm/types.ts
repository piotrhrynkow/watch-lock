import { PathAccess } from '../../service/path-access-checker';

export interface ActionComposerPackModelType {
  id: string;
  selected: boolean;
  composerPackId: string | null;
  composerPack: ComposerPackModelType;
}

export interface ActionPackModelType {
  id: string;
  hash: string;
  packId: string;
  pack: PackModelType;
}

export interface ActionProjectModelType {
  id: string;
  selected: boolean;
  projectId: string | null;
  project: ProjectModelType;
}

export interface ComposerModelType {
  id: string;
  packName: string | null;
  json: {
    path: string;
    access: PathAccess;
  };
  lock: {
    path: string;
    access: PathAccess;
  };
  projectId: string | null;
  project: ProjectModelType;
  composerPacks: ComposerPackModelType[];
}

export interface ComposerPackModelType {
  id: string;
  composerId: string;
  packId: string;
  hash: string;
  time: Date | null;
  composer: ComposerModelType;
  pack: PackModelType;
  actionComposerPack: ActionComposerPackModelType;
}

export interface PackModelType {
  id: string;
  name: string;
  sourceUrl: string;
  composerPacks: ComposerPackModelType[];
  actionPackId: string | null;
  actionPack: ActionPackModelType | null;
}

export interface ProjectModelType {
  id: string;
  rootDirectory: {
    path: string;
    access: PathAccess;
  };
  composer: ComposerModelType;
  git: {
    path: string;
    access: PathAccess;
    hasRepo: boolean;
  };
  actionProjectId: string | null;
  actionProject: ActionProjectModelType | null;
}

export interface UUIDModelType {
  id: string;
}

export interface WatchedPackModelType {
  id: string;
  name: string;
  enabled: boolean;
  packId: string | null;
  pack: PackModelType;
}
