import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
  faArchive,
  faFolder,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import PathDialog from '../../service/path-dialog';
import { removeConfigBackup, setConfigBackup } from '../../store/actions';
import { PathAccessChecker } from '../../service/path-access-checker';
import Icon from '../project-list/Icon';
import { ConfigBackup, State } from '../../store/types';

function BackupSelector(props: {
  backup: ConfigBackup | null;
  removeConfigBackup: () => void;
  setConfigBackup: (payload: ConfigBackup) => void;
}) {
  const showDialog = async (): Promise<void> => {
    const directoryPath: string | null = await PathDialog.showDirectoryDialog();
    if (directoryPath) {
      const { setConfigBackup } = props;
      setConfigBackup({
        directoryPath,
        access: await PathAccessChecker.getPathAccess(directoryPath),
      });
    }
  };

  const getBackupElementData = () => {
    const { backup, removeConfigBackup } = props;
    if (backup) {
      return (
        <>
          <div className="path">{backup?.directoryPath}</div>
          <div className="status">
            <Icon icon={faFolder} isActive={backup.access?.writable} />
          </div>
          <div className="action">
            <FA
              icon={faTrashAlt}
              className="clickable"
              onClick={removeConfigBackup}
            />
          </div>
        </>
      );
    }
  };

  return (
    <>
      <div className="backup">
        <div className="common row">
          <div className="icon">
            <div className="round-icon">
              <FA icon={faArchive} className="icon-folder-open" />
            </div>
          </div>
          <div className="select clickable" onClick={showDialog}>
            <span className="ml-1p">Select backup directory</span>
          </div>
          {getBackupElementData()}
        </div>
      </div>
    </>
  );
}

const mapStateToProps = (state: State) => {
  return {
    backup: state.config.backup,
  };
};
export default connect(mapStateToProps, {
  removeConfigBackup,
  setConfigBackup,
})(BackupSelector);
