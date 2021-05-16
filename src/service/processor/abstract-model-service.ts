import { AnyAction, Store } from 'redux';
import { IndexedModelClasses } from 'redux-orm/ORM';
import { OrmSession } from 'redux-orm/Session';
import orm from '../../store/reducers/orm';
import UUIDProvider from '../uuid-provider';

export default abstract class AbstractModelService {
  protected abstract getStore(): Store;

  protected dispatch(action: AnyAction): AnyAction {
    return this.getStore().dispatch(action);
  }

  protected getModelSession(): OrmSession<
    IndexedModelClasses<any, string | number | symbol>
  > {
    return orm.session(this.getStore().getState().orm);
  }

  protected generateUUID(): string {
    return UUIDProvider.getStoreUUID(this.getStore());
  }

  protected addUUIDs(ids: string[]): void {
    UUIDProvider.addStoreMissingUUIDs(this.getStore(), ids);
  }
}
