import React from 'react';
import { connect } from 'react-redux';
import { State } from '../store';
import PackWatchList from './actions/PackWatchList';
import Layout from './Layout';

function ActionList() {
  return (
    <>
      <Layout>
        <PackWatchList />
      </Layout>
    </>
  );
}

const mapStateToProps = (state: State) => {
  return {};
};
export default connect(mapStateToProps, {})(ActionList);
