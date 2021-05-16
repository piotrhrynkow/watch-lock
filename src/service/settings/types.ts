export default interface Root {
  config: {
    backup: string | null;
  };
  tokens: Token[];
  projects: Project[];
  composers: Composer[];
  watchedPacks: WatchedPack[];
  ids: UUID[];
}

export declare interface Token {
  id: UUID;
  name: string;
  hash: string;
}

export interface Project {
  id: UUID;
  directory: {
    path: string;
  };
}

export interface Composer {
  id: UUID;
  jsonPath: string;
  lockPath: string;
  projectId: UUID;
}

export interface WatchedPack {
  id: UUID;
  name: string;
  enabled: boolean;
}

declare type UUID = string;
