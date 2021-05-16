import { Store } from 'redux';
import { v4 as uuid } from 'uuid';
import { addUUID, addUUIDs } from '../store/actions';

export default class UUIDProvider {
  public constructor(private readonly store: Store) {}

  public getUUIDs = (): string[] => {
    return this.store.getState().uuid;
  };

  public hasUUID = (id: string): boolean => {
    const ids: string[] = this.getUUIDs();

    return ids.includes(id);
  };

  public getUUID = (): string => {
    const ids: string[] = this.getUUIDs();
    while (true) {
      const id: string = uuid();
      if (!ids.includes(id)) {
        this.store.dispatch(addUUID(id));

        return id;
      }
    }
  };

  public addUUID = (id: string): string => {
    if (this.hasUUID(id)) {
      throw Error(`Id ${id} is not unique`);
    }
    this.store.dispatch(addUUID(id));

    return id;
  };

  public addMissingUUID = (id: string): string => {
    if (!this.hasUUID(id)) {
      this.store.dispatch(addUUID(id));
    }

    return id;
  };

  public addMissingUUIDs = (ids: string[]): void => {
    const filteredIds = ids.filter((id: string) => !this.hasUUID(id));
    this.store.dispatch(addUUIDs(filteredIds));
  };

  public static getStoreUUID = (store: Store): string => {
    return new UUIDProvider(store).getUUID();
  };

  public static addStoreMissingUUIDs = (store: Store, ids: string[]): void => {
    return new UUIDProvider(store).addMissingUUIDs(ids);
  };
}
