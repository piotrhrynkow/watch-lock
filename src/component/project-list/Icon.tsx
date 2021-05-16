import React from 'react';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faSquare } from '@fortawesome/free-solid-svg-icons';
import classnames from 'classnames';

function Icon(props: { icon: IconDefinition; isActive: any }) {
  const getIconColor = (isActive: any): string => {
    const classes: { [key: string]: boolean } = {
      'color-success': Boolean(isActive),
      'color-danger': !Boolean(isActive),
    };

    return classnames(classes);
  };

  const { icon, isActive } = props;

  return (
    <>
      <span className="fa-layers fa-fw icon">
        <FA icon={faSquare} size="2x" className={getIconColor(isActive)} />
        <FA icon={icon} inverse transform="right-4" />
      </span>
    </>
  );
}

export default React.memo(Icon);
