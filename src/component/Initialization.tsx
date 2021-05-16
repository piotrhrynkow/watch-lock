import React, { useEffect, useState } from 'react';
import { connect, useStore } from 'react-redux';
import { Store } from 'redux';
import { Redirect } from 'react-router-dom';
import LoadingRing from './LoadingRing';
import ConfigImporter from '../service/settings/config-importer';
import { State } from '../store/types';

function Initialization(props: { filePath: string }) {
  const store: Store = useStore();
  const [isLoading, setLoading] = useState(true);

  const importAll = async () => {
    const { filePath } = props;

    const importer: ConfigImporter = new ConfigImporter(store);
    await importer.import(filePath);

    setLoading(false);
  };

  useEffect(() => {
    importAll();
    return () => {};
  }, []);

  return (
    <>
      {isLoading && (
        <div className="common center">
          <div className="centered">
            <LoadingRing />
          </div>
        </div>
      )}
      {!isLoading && <Redirect to="/actions" />}
    </>
  );
}

const mapStateToProps = (state: State) => {
  return {
    filePath: state.config.filePath,
  };
};
export default connect(mapStateToProps, {})(Initialization);
