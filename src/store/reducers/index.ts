import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import config from './config';
import lockUpdated from './lock-updated';
import log from './log';
import processing from './processing';
import token from './token';
import uuid from './uuid';
import { reducer as orm } from './orm';

const createRootReducer = (history: any) =>
  combineReducers({
    router: connectRouter(history),
    orm,
    config,
    lockUpdated,
    log,
    processing,
    token,
    uuid,
  });
export default createRootReducer;
