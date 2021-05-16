import { v4 as uuid } from 'uuid';

export default class Token {
  public readonly id: string;

  public repositoryCount: number = 0;

  public constructor(public name: string, public hash: string, id?: string) {
    this.id = id || uuid();
  }

  public static hydrate(data: {
    id: string;
    name: string;
    hash: string;
  }): Token {
    return new Token(data.name, data.hash, data.id);
  }
}
