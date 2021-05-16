import { shell } from 'electron';
import React from 'react';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { State } from '../store/types';
import { setConfigVersion } from '../store/actions';
import packageData from '../package.json';

function Footer(props: {
  version: string | null;
  setConfigVersion: (payload: string) => void;
}) {
  const { author, version: packageVersion } = packageData;
  const { version, setConfigVersion } = props;
  if (!version) {
    setConfigVersion(packageVersion);
  }

  return (
    <>
      <footer>
        <span
          className="clickable"
          onClick={() => shell.openExternal(author.url)}
        >
          <FA icon={faGithub} /> {version}
        </span>
      </footer>
    </>
  );
}

const mapStateToProps = (state: State) => {
  return {
    version: state.config.version,
  };
};
export default connect(mapStateToProps, {
  setConfigVersion,
})(Footer);
