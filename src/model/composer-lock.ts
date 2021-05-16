/* eslint-disable prettier/prettier */
export interface Lock {
  '_readme'?: string[];
  'homepage'?: string;
  'content-hash': string;
  'packages'?: Package[];
  'packages-dev'?: Package[];
  'minimum-stability': 'dev' | 'alpha' | 'beta' | 'RC' | 'stable';
  'stability-flags': string[];
  'prefer-stable': boolean;
  'prefer-lowest': boolean;
}

export interface Package {
  'name': string;
  'version': string;
  'source': {
    'type': 'git' | string;
    'url': string;
    'reference': string;
  },
  'dist': {
    'type': 'zip' | string;
    'url': string;
    'reference': string;
    'shasum': string;
  },
  'require'?: {
    [key: string]: string;
  },
  'require-dev'?: {
    [key: string]: string;
  },
  'type': 'library' | string,
  'extra': {
    'branch-alias': {
      [key: string]: string;
    }
  },
  'autoload'?: AutoloadTypes;
  'autoload-dev'?: AutoloadTypes;
  'abandoned'?: string | boolean;
  'time': string;
}

declare type AutoloadTypes = {
  'psr-0'?: { [key: string]: string | string[] };
  'psr-4'?: { [key: string]: string | string[] };
  'classmap'?: string[];
  'files'?: string[];
  'exclude-from-classmap'?: string[];
};
/* eslint-enable prettier/prettier */
