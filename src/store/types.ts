import Token from '../model/token';
import { LockUpdated } from '../model/types';
import { PathAccess } from '../service/path-access-checker';

export interface State {
  config: ConfigState;
  lockUpdated: { [key: string]: LockUpdated };
  log: string[];
  token: { items: Token[] };
  uuid: string[];
}

export interface ConfigState {
  filePath: string | null;
  backup: ConfigBackup | null;
  version: string | null;
}

export interface ConfigBackup {
  directoryPath: string;
  access: PathAccess;
}
