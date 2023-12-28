import ListIcon from '@mui/icons-material/List';
import SearchIcon from '@mui/icons-material/Search';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { routes } from 'renderer/constants';
import styled from 'styled-components';

const Container = styled.div`
  width: calc(100% - 335px);
  display: flex;
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #161618;
`;

const MenuItem = styled.div`
  border-top: 1px solid #565f6c;
  height: 48px;
  justify-content: center;
  align-items: center;
  display: flex;
  flex: 1;
  &:first-child {
    border-left: 1px solid #565f6c;
  }
  &:nth-child(2n) {
    border-left: 1px solid #565f6c;
  }
  &:hover {
    cursor: pointer;
    color: #f0ad4e;
  }
`;

const Navigation: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <Container>
      <MenuItem>
        <NavLink
          to={routes.PLAYLIST}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: location.pathname.includes('playlist')
              ? '#f0ad4e'
              : '#ffffff',
          }}
        >
          <>
            <ListIcon style={{ paddingRight: '8px' }} />
            {t('Navigation.playlists')}
          </>
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink
          to={routes.SEARCH}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: !location.pathname.includes('playlist')
              ? '#f0ad4e'
              : '#ffffff',
          }}
        >
          <>
            <SearchIcon style={{ paddingRight: '8px' }} />
            {t('Navigation.search')}
          </>
        </NavLink>
      </MenuItem>
    </Container>
  );
};

export default Navigation;
