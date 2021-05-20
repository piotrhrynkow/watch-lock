import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
  faCodeBranch,
  faCog,
  faFileImport,
  faSave,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { Location } from 'history';
import StoreExport from './StoreExport';

function Header() {
  const navList: NavItem[] = [
    {
      to: '/actions',
      icon: faFileImport,
      label: 'Actions',
    },
    {
      to: '/dependency-tree',
      icon: faCodeBranch,
      label: 'Dependency',
    },
    {
      to: '/settings',
      icon: faCog,
      label: 'Settings',
    },
  ];

  const history = useHistory();
  const location: Location = useLocation();

  const goToRoute = (route: string) => {
    history.push(route);
  };

  const listNavLi = navList.map((item: NavItem) => (
    <li
      key={item.label}
      className="clickable"
      onClick={() => goToRoute(item.to)}
    >
      <FA icon={item.icon} /> {item.label}
    </li>
  ));

  return (
    <>
      <header className="mb-5p">
        <nav>
          <ul className="left">{listNavLi}</ul>
          <ul className="right">
            {location.pathname === '/settings' && (
              <li className="clickable">
                <StoreExport>
                  <FA icon={faSave} /> Save
                </StoreExport>
              </li>
            )}
          </ul>
        </nav>
      </header>
    </>
  );
}

declare type NavItem = { to: string; icon: IconDefinition; label: string };

export default React.memo(Header);
