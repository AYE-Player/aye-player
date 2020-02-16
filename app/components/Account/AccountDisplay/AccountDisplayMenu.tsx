import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Menu, { MenuProps } from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import withStyles from "@material-ui/core/styles/withStyles";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import routes from "../../../constants/routes.json";
import RootStore from "../../../dataLayer/stores/RootStore";
import useInject from "../../../hooks/useInject";
import Divider from "../../Divider";

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
    backgroundColor: "#3D4653",
    boxShadow:
      "0 6px 10px 0 rgba(0, 0, 0, 0.2), 0 8px 22px 0 rgba(0, 0, 0, 0.19)",
    color: "#f2f5f4"
  }
})((props: MenuProps) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "top",
      horizontal: "center"
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right"
    }}
    {...props}
  />
));

const AccountDisplayMenu: React.FunctionComponent<IAccountDisplayMenuProps> = props => {
  const { t } = useTranslation();

  const Store = ({ user, player, playlists }: RootStore) => ({
    user,
    player,
    playlists
  });

  const { user, player, playlists } = useInject(Store);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const _handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const _handleClose = () => {
    setAnchorEl(null);
  };

  const _handleLogoutClick = () => {
    user.logout();
    player.setCurrentPlaylist(undefined);
    playlists.clear();
    setAnchorEl(null);
  };

  const _handleProfileClick = () => {
    // navigate to the account page AND close the menu
    setAnchorEl(null);
    window.location.href = `${window.location.href.split("#/")[0]}#${
      routes.ACCOUNT
    }`;
  };

  const _handleSettingsClick = () => {
    // navigate to the account page AND close the menu
    setAnchorEl(null);
    window.location.href = `${window.location.href.split("#/")[0]}#${
      routes.APPSETTINGS
    }`;
  };

  return (
    <ClickAwayListener onClickAway={_handleClose}>
      <Container onClick={_handleClick}>
        {props.children}
        <StyledMenu
          id="account-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={_handleClose}
        >
          <MenuItem onClick={() => _handleProfileClick()}>
            {t("AccountDisplay.Menu.profile")}
          </MenuItem>
          <MenuItem onClick={() => _handleSettingsClick()}>
            {t("AccountDisplay.Menu.settings")}
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => _handleLogoutClick()}>
            {t("AccountDisplay.Menu.logout")}
          </MenuItem>
        </StyledMenu>
      </Container>
    </ClickAwayListener>
  );
};

export default AccountDisplayMenu;
