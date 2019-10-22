import React from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { observer } from "mobx-react-lite";
import useInject from "../../hooks/useInject";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";

const Container = styled.div`
  width: calc(100% - 320px);
  display: flex;
  position: absolute;
  bottom: 0;
  right: 0;
`;

const MenuItem = styled.div`
  border-top: 1px solid #565f6c;
  height: 45px;
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

  return (
    <Container>
      <MenuItem>
        <NavLink
          exact
          activeClassName="activeLink"
          to="/"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          Search
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink
          exact
          activeClassName="activeLink"
          to="/playlist"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          Playlist
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink
          exact
          activeClassName="activeLink"
          to="/account"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {user.isAuthenticated ? "Account" : "Login"}
        </NavLink>
      </MenuItem>
    </Container>
  );
};

export default observer(Navigation);
