import React from 'react';
import { Store } from 'redux';
import { connect, useStore } from 'react-redux';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { filter, isEmpty } from 'lodash';
import { State } from '../../store';
import PathDialog from '../../service/path-dialog';
import { selectModelProjects } from '../../store/selectors';
import { ProjectModelType } from '../../model/orm/types';
import ProjectsSelector from '../../service/settings/projects-selector';

function ProjectSelector(props: { projects: ProjectModelType[] }) {
  const store: Store = useStore();

  const isProjectDirectoryExists = (directoryPath: string): boolean => {
    const { projects } = props;
    return !isEmpty(
      filter(
        projects,
        (project: ProjectModelType) =>
          project.rootDirectory.path === directoryPath
      )
    );
  };

  const showDialog = async () => {
    const directoryPaths: string[] = [];
    const selectedDirectoryPaths: string[] = await PathDialog.showDirectoriesDialog();
    selectedDirectoryPaths.forEach((directoryPath: string) => {
      if (!isProjectDirectoryExists(directoryPath)) {
        directoryPaths.push(directoryPath);
      }
    });
    const projectsSelector = new ProjectsSelector(store, directoryPaths);
    await projectsSelector.process();
  };

  return (
    <>
      <div className="common row">
        <div className="clickable" onClick={() => showDialog()}>
          <div className="round-icon">
            <FA icon={faFolderOpen} className="icon-folder-open" />
          </div>
          <span className="ml-1p">Add project directories</span>
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state: State) => {
  return {
    projects: selectModelProjects(state),
  };
};
export default connect(mapStateToProps, {})(ProjectSelector);
