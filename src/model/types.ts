export interface LockDiff {
  path: string;
  diffHtml: string;
}

export interface LockUpdated {
  id: string;
  lockDiffs: LockDiff[];
}
