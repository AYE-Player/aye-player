import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Menu, { MenuProps } from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import withStyles from "@material-ui/styles/withStyles";
import React from "react";
import styled from "styled-components";
import useInject from "../../../hooks/useInject";
import { RootStoreModel } from "../../../dataLayer/stores/RootStore";

interface IAccountDisplayMenuProps {}

const Container = styled.div`
  height: 30px;
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
    color: "#FBFBFB"
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

const AccountDisplayMenu: React.FunctionComponent<
  IAccountDisplayMenuProps
> = props => {
  const Store = ({ user }: RootStoreModel) => ({
    user
  });

  const { user } = useInject(Store);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const _handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const _handleClose = () => {
    setAnchorEl(null);
  };

  const _handleLogoutClick = () => {
    user.logout();
    setAnchorEl(null);
  };

  const _handleProfileClick = () => {
    // navigate to the account page AND close the menu
    setAnchorEl(null);
    window.location.href = `${window.location.href.split("#/")[0]}#/account`;
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
          <MenuItem onClick={() => _handleProfileClick()}>Profile</MenuItem>
          <MenuItem onClick={() => _handleLogoutClick()}>Logout</MenuItem>
        </StyledMenu>
      </Container>
    </ClickAwayListener>
  );
};

export default AccountDisplayMenu;
