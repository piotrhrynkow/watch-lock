import React from 'react';
import { connect } from 'react-redux';
import Layout from './component/Layout';
import BackupSelector from './component/settings/BackupSelector';
import ProjectSelector from './component/settings/ProjectSelector';
import ProjectList from './component/settings/ProjectList';
import PackageSelectForm from './component/form/PackageSelectForm';
import PackWatchList from './component/settings/PackWatchList';
import { State } from './store';

function Settings() {
  return (
    <Layout>
      <div className="main">
        <div>
          <h1>Backup</h1>
          <BackupSelector />
        </div>

        <div>
          <h1>Projects</h1>
          <ProjectSelector />
          <div className="mb-1p" />
          <ProjectList />
        </div>

        <div>
          <h1>Packages</h1>
          <PackageSelectForm />
          <div className="mb-1p" />
          <PackWatchList />
        </div>
      </div>
    </Layout>
  );
}

const mapStateToProps = (state: State) => {
  return {};
};
export default connect(mapStateToProps, {})(Settings);
