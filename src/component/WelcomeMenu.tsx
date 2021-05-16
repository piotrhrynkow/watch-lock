import React from 'react';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import PathDialog from '../service/path-dialog';
import { setConfigFile } from '../store/actions';
import { State } from '../store';
import logo from '../../assets/logo.png';

function WelcomeMenu(props: { setConfigFile: (payload: string) => void }) {
  const history = useHistory();

  const { setConfigFile } = props;

  const showDialog = async (): Promise<void> => {
    const filePath: string | null = await PathDialog.showConfigFileDialog();
    if (filePath) {
      setConfigFile(filePath);
      history.push('/initialization');
    }
  };

  return (
    <div className="main welcome">
      <div className="common row text-center">
        <img src={logo} className="logo" alt="logo" />
      </div>
      <div className="mb-1p" />
      <div className="common row">
        <Link to="/settings">
          <div className="clickable">
            <div className="round-icon">
              <FA icon={faFolderPlus} className="icon-folder-open" />
            </div>
            <span className="ml-1p">Create new</span>
          </div>
        </Link>
      </div>
      <div className="mb-1p" />
      <div className="common row">
        <div className="clickable" onClick={() => showDialog()}>
          <div className="round-icon">
            <FA icon={faFolderOpen} className="icon-folder-open" />
          </div>
          <span className="ml-1p">Open file</span>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: State) => {
  return {};
};
export default connect(mapStateToProps, {
  setConfigFile,
})(WelcomeMenu);
