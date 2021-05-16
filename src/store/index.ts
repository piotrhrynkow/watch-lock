import { createBrowserHistory } from 'history';
import { applyMiddleware, compose, createStore } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from './reducers';
import Token from '../model/token';
import { LockUpdated } from '../model/types';

export const history = createBrowserHistory();

export default function configureStore(preloadedState: any): any {
  const store = createStore(
    createRootReducer(history),
    preloadedState,
    compose(applyMiddleware(routerMiddleware(history)))
  );

  return store;
}

export interface State {
  config: ConfigState;
  lockUpdated: { [key: string]: LockUpdated };
  log: string[];
  token: { items: Token[] };
  uuid: string[];
}

export interface ConfigState {
  filePath: string | null;
}
