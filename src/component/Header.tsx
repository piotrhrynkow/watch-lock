import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
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
      className="fl clickable"
      onClick={() => goToRoute(item.to)}
    >
      <FA icon={item.icon} /> {item.label}
    </li>
  ));

  return (
    <>
      <header className="mb-5p">
        <nav>
          <ul className="fl">{listNavLi}</ul>
          <ul className="fr">
            {location.pathname === '/settings' && (
              <li className="fr">
                <StoreExport className="clickable">
                  <FA icon={faSave} /> Save
                </StoreExport>
              </li>
            )}
          </ul>
          <div className="clrb" />
        </nav>
      </header>
    </>
  );
}

declare type NavItem = { to: string; icon: IconDefinition; label: string };

export default React.memo(Header);
