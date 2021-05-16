import { filter } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, useParams } from 'react-router';
import { LockDiff, LockUpdated } from '../../model/types';
import { State } from '../../store';
import Layout from '../Layout';

function LockDiffViewer(props: {
  lockUpdates: { [key: string]: LockUpdated };
}) {
  const { id } = useParams();
  const { lockUpdates } = props;

  const filteredLockUpdates = filter(
    lockUpdates,
    (lockUpdated: LockUpdated) => lockUpdated.id === id
  );
  const lockUpdated: LockUpdated | undefined = filteredLockUpdates.pop();

  if (!lockUpdated) {
    return <Redirect to="/actions" />;
  }

  const listLockDiffs = lockUpdated.lockDiffs.map((lockDiff: LockDiff) => (
    <div key={lockDiff.path}>
      <h1>{lockDiff.path}</h1>
      <div
        className="common row"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: lockDiff.diffHtml,
        }}
      />
    </div>
  ));

  return (
    <>
      <Layout>
        <div className="main">{listLockDiffs}</div>
      </Layout>
    </>
  );
}

const mapStateToProps = (state: State) => {
  return {
    lockUpdates: state.lockUpdated,
  };
};
export default connect(mapStateToProps, {})(LockDiffViewer);
