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
import { forEach, map } from 'lodash';
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
import { State } from '../../store';
import { ComposerPackModelType, ProjectModelType } from '../../model/orm/types';

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
  const state = useStore().getState();
  useSelector(selectUpdatedAtProcessing);

  const removeProjectWithRelated = (project: ProjectModelType) => {
    forEach(
      project.composer.composerPacks,
      (composerPack: ComposerPackModelType) => {
        removeComposerPackModel(composerPack.id);
      }
    );
    removeComposerModel(project.composer.id);
    removeProjectModel(project.id);
  };

  const projects: ProjectModelType[] = selectModelProjectsWithRelations(state);
  const listProjects = map(projects, (project: ProjectModelType) => (
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
        <FA icon={faSyncAlt} className="clickable" />{' '}
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
