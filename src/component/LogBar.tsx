import React from 'react';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { State } from '../store';
import { removeLog } from '../store/actions';
import Log from '../model/log';

function LogBar(props: { logs: Log[]; removeLog: (payload: number) => void }) {
  const { logs, removeLog } = props;

  const listLogs = logs.map((log: Log, i: number) => (
    <div className="log" key={log.id}>
      <div className="message">{log.message}</div>
      <div className="close">
        <FA icon={faTimes} onClick={() => removeLog(i)} />
      </div>
    </div>
  ));

  return (
    <>{listLogs.length > 0 && <div className="log-bar">{listLogs}</div>}</>
  );
}

const mapStateToProps = (state: State) => {
  return {
    logs: state.log,
  };
};
export default connect(mapStateToProps, { removeLog })(LogBar);
