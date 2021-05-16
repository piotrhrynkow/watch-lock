import { createReducer, ORM } from 'redux-orm';
import Composer from '../../model/orm/composer';
import Pack from '../../model/orm/pack';
import ComposerPack from '../../model/orm/composer-pack';
import Project from '../../model/orm/project';
import WatchedPack from '../../model/orm/watched-pack';
import ActionPack from '../../model/orm/action-pack';
import UUID from '../../model/orm/uuid';
import ActionProject from '../../model/orm/action-project';
import ActionComposerPack from '../../model/orm/action-composer-pack';

const orm = new ORM({
  stateSelector: (state: any) => state.orm,
});
orm.register(
  ActionComposerPack,
  ActionPack,
  ActionProject,
  Composer,
  ComposerPack,
  Pack,
  Project,
  WatchedPack,
  UUID
);

export default orm;

export const reducer = createReducer(orm);
