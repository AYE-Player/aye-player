import { ClickAwayListener, Menu, MenuItem, MenuProps } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import routes from '../../../constants/routes.json';
import Divider from '../../Divider';
import { useStore } from '../../StoreProvider';

interface IAccountDisplayMenuProps {
  children?: any;
}

const Container = styled.div`
  height: 32px;
  right: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const StyledMenu = withStyles({
  paper: {
    backgroundColor: '#3D4653',
    boxShadow:
      '0 6px 10px 0 rgba(0, 0, 0, 0.2), 0 8px 22px 0 rgba(0, 0, 0, 0.19)',
    color: '#f2f5f4',
  },
})((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

const AccountDisplayMenu: React.FunctionComponent<IAccountDisplayMenuProps> = (
  props,
) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { children } = props;

  const { user, player, playlists } = useStore();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    user.logout();
    player.setCurrentPlaylist(undefined);
    playlists.clear();
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    // navigate to the account page AND close the menu
    setAnchorEl(null);
    navigate(routes.ACCOUNT);
  };

  const handleSettingsClick = () => {
    // navigate to the account page AND close the menu
    setAnchorEl(null);
    navigate(routes.APPSETTINGS);
  };

  const handleAdminClick = () => {
    setAnchorEl(null);
    navigate(routes.ADMIN);
  };

  return (
    <ClickAwayListener onClickAway={handleClose} disableReactTree>
      <Container onClick={handleClick}>
        {children}
        <StyledMenu
          id="account-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleProfileClick}>
            {t('AccountDisplay.Menu.profile')}
          </MenuItem>
          <MenuItem onClick={handleSettingsClick}>
            {t('AccountDisplay.Menu.settings')}
          </MenuItem>
          {user.roles.includes('Admin') && (
            <MenuItem onClick={handleAdminClick}>
              {t('AccountDisplay.Menu.admin')}
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={handleLogoutClick}>
            {t('AccountDisplay.Menu.logout')}
          </MenuItem>
        </StyledMenu>
      </Container>
    </ClickAwayListener>
  );
};

AccountDisplayMenu.defaultProps = {
  children: undefined,
};

export default AccountDisplayMenu;
