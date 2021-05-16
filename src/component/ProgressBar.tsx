import React from 'react';
import classnames from 'classnames';

function ProgressBar(props: { show: boolean }) {
  const { show } = props;
  const classes: { [key: string]: boolean } = {
    'progress-bar': true,
    animated: show,
    invisible: !show,
  };
  return (
    <>
      <div className={classnames(classes)} />
    </>
  );
}

export default ProgressBar;
