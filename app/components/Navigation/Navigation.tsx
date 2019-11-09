import { observer } from "mobx-react-lite";
import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  width: calc(100% - 336px);
  display: flex;
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #232c39;
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
    border-right: 1px solid #565f6c;
  }
`;

const Navigation: React.FunctionComponent<any> = props => {
  const { t } = useTranslation();

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
          {t("Navigation.search")}
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
          {t("Navigation.playlists")}
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink
          exact
          activeClassName="activeLink"
          to="/settings"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {t("Navigation.settings")}
        </NavLink>
      </MenuItem>
    </Container>
  );
};

export default observer(Navigation);
