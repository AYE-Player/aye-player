import React from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { observer } from "mobx-react-lite";
import useInject from "../../hooks/useInject";
import { RootStoreModel } from "../../stores/RootStore";

const Container = styled.div`
  width: calc(100% - 320px);
  display: flex;
  position: absolute;
  margin: 10px;
  bottom: 0;
  right: 0;
`;

const MenuItem = styled.div`
  border-top: 1px solid #565f6c;
  height: 36px;
  justify-content: center;
  align-items: center;
  display: flex;
  flex: 1;
  &:nth-child(2n) {
    border-left: 1px solid #565f6c;
    border-right: 1px solid #565f6c;
  }
`;

const Navigation: React.FunctionComponent<any> = props => {
  const Store = ({ user }: RootStoreModel) => ({
    user
  });

  const { user } = useInject(Store);
  const test = () => {
    console.log("bla", window.location)
    console.log("user", user.isAuthenticated);
  }

  return (
    <Container>
      <MenuItem>
        <NavLink exact activeClassName="activeLink" to="/">
          Search
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink exact activeClassName="activeLink" to="/playlist">
          Playlist
        </NavLink>
      </MenuItem>
      <MenuItem>
        {user.isAuthenticated ? (
          <NavLink
            exact
            activeClassName="activeLink"
            to="/account"
            onClick={test}
          >
            Account
          </NavLink>
        ) : (
          <NavLink
            exact
            activeClassName="activeLink"
            to="/login"
          >
            Login
          </NavLink>
        )}
      </MenuItem>
    </Container>
  );
};

export default observer(Navigation);
