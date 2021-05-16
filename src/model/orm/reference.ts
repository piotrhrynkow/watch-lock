import { isString } from 'lodash';

export default class Reference {
  public constructor(
    private readonly reference: any,
    private readonly identifier: string
  ) {}

  public getId(): string {
    return this.reference[this.identifier];
  }

  public hasId(): boolean {
    return this.identifier in this.reference;
  }

  public toString(): string {
    return this.getId();
  }

  public static getObjectId(object: string | Reference): string | null {
    if (isString(object)) {
      return object;
    }
    if (object instanceof Reference && object.hasId()) {
      return object.getId();
    }

    return null;
  }
}
