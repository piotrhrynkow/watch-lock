import AuthorizedRepositoryFetcher from '../../service/github/authorized-repository-fetcher';
import throwRuleError from './rule-error-thrower';

export default async (token: any, path: string[], message: string, type: string = 'any.token'): Promise<undefined> => {
  try {
    const authorizedRepositoryFetcher: AuthorizedRepositoryFetcher = new AuthorizedRepositoryFetcher(token);
    await authorizedRepositoryFetcher.countRepositories();
  } catch (error) {
    throwRuleError(path, message, type);
  }

  return undefined;
};
