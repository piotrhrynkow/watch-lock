import React from 'react';
import { connect, useSelector, useStore } from 'react-redux';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
  faChild as faComposer,
  faFolder,
  faSyncAlt,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faGit } from '@fortawesome/free-brands-svg-icons';
import { forEach, map, sortBy } from 'lodash';
import {
  removeComposerModel,
  removeComposerPackModel,
  removeProjectModel,
  setUpdatedAtProcessing,
} from '../../store/actions';
import Icon from '../project-list/Icon';
import {
  selectModelProjectsWithRelations,
  selectUpdatedAtProcessing,
} from '../../store/selectors';
import { ComposerPackModelType, ProjectModelType } from '../../model/orm/types';
import ProjectsSelector from '../../service/settings/projects-selector';
import { State } from '../../store/types';

function ProjectList(props: {
  removeComposerModel: (id: string) => void;
  removeComposerPackModel: (id: string) => void;
  removeProjectModel: (id: string) => void;
  setUpdatedAtProcessing: () => void;
}) {
  const {
    removeComposerModel,
    removeComposerPackModel,
    removeProjectModel,
    setUpdatedAtProcessing,
  } = props;
  const store = useStore();
  const state = store.getState();
  useSelector(selectUpdatedAtProcessing);

  const removeProjectWithRelated = (project: ProjectModelType): void => {
    forEach(
      project.composer.composerPacks,
      (composerPack: ComposerPackModelType) => {
        removeComposerPackModel(composerPack.id);
      }
    );
    removeComposerModel(project.composer.id);
    removeProjectModel(project.id);
  };

  const hardResetProject = async (project: ProjectModelType): Promise<void> => {
    removeProjectWithRelated(project);
    const projectsSelector = new ProjectsSelector(store, [
      project.rootDirectory.path,
    ]);
    await projectsSelector.process();
    setUpdatedAtProcessing();
  };

  const projects: ProjectModelType[] = selectModelProjectsWithRelations(state);
  const sortedProjects: ProjectModelType[] = sortBy(
    projects,
    (project: ProjectModelType) => project.rootDirectory.path
  );
  const listProjects = map(sortedProjects, (project: ProjectModelType) => (
    <tr key={project.id}>
      <td>{project.rootDirectory.path}</td>
      <td>
        <Icon icon={faFolder} isActive={project.rootDirectory.access.exists} />
        <Icon
          icon={faComposer}
          isActive={
            project.composer.lock.access.readable &&
            project.composer.lock.access.writable
          }
        />
        <Icon icon={faGit} isActive={project.git?.hasRepo} />
      </td>
      <td>
        <FA
          icon={faSyncAlt}
          className="clickable"
          onClick={() => hardResetProject(project)}
        />{' '}
        <FA
          icon={faTrashAlt}
          className="clickable"
          onClick={() => {
            removeProjectWithRelated(project);
            setUpdatedAtProcessing();
          }}
        />
      </td>
    </tr>
  ));

  return (
    <>
      <table className="table-projects">
        <tbody>{listProjects}</tbody>
      </table>
    </>
  );
}

const mapStateToProps = (state: State) => {
  return {};
};
export default connect(mapStateToProps, {
  removeComposerModel,
  removeComposerPackModel,
  removeProjectModel,
  setUpdatedAtProcessing,
})(ProjectList);
