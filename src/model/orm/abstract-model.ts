import { Model } from 'redux-orm';
import { v4 as uuid } from 'uuid';

export default abstract class AbstractModel extends Model {
  protected static injectUUID(
    session: any,
    action: { type: string; payload: any }
  ): void {
    if (!action.payload?.[this.idAttribute]) {
      action.payload[this.idAttribute] = AbstractModel.generateUUID(session);
    }
  }

  protected static generateUUID(session: any): string {
    const { UUID } = session;
    while (true) {
      const id: string = uuid();
      if (!UUID.idExists(id)) {
        UUID.create({ id });

        return id;
      }
    }
  }
}
