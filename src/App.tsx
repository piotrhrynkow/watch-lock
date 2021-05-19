import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import WelcomeMenu from './component/WelcomeMenu';
import Initialization from './component/Initialization';
import ActionList from './component/ActionList';
import LockDiffViewer from './component/actions/LockDiffViewer';
import DependencyTree from './component/DependencyTree';
import Settings from './Settings';
import configureStore, { history } from './store';

const store = configureStore({});

export default function App() {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Router>
          <Switch>
            <Route path="/" exact component={WelcomeMenu} />
            <Route path="/initialization" component={Initialization} />
            <Route path="/actions" exact component={ActionList} />
            <Route path="/actions/lock-diff/:id" component={LockDiffViewer} />
            <Route path="/dependency-tree" component={DependencyTree} />
            <Route path="/settings" component={Settings} />
          </Switch>
        </Router>
      </ConnectedRouter>
    </Provider>
  );
}
