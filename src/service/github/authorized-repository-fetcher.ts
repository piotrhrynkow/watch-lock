import { Octokit } from '@octokit/rest';
import { graphql } from "@octokit/graphql";

// TODO catch somehow wrong token

export default class AuthorizedRepositoryFetcher {
  public constructor(
    private readonly token: string
  ) {}

  public async countRepositories(): Promise<number> {
    const { viewer } = await this.createGraphqlClient()(`
      {
        viewer {
          repositories {
            totalCount
          }
        }
      }
    `);

    return viewer?.repositories?.totalCount ?? 0;
  }

  public async getRepositories() { // TODO pagination
    const result = this.createRestClient().repos.listForAuthenticatedUser();

    return result.data;
  }

  private createRestClient(): Octokit {
    return new Octokit({
      auth: this.token
    });
  }

  private createGraphqlClient() {
    return graphql.defaults({
      headers: {
        authorization: `token ${this.token}`
      }
    });
  }
}
