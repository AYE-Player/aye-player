import ListIcon from "@material-ui/icons/List";
import SearchIcon from "@material-ui/icons/Search";
import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import routes from "../constants/routes.json";

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
`;

const Navigation: React.FunctionComponent<any> = props => {
  const { t } = useTranslation();

  return (
    <Container>
      <MenuItem>
        <NavLink
          exact
          activeClassName="activeLink"
          to={routes.SEARCH}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <SearchIcon style={{ paddingRight: "8px" }} />
          {t("Navigation.search")}
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink
          exact
          activeClassName="activeLink"
          to={routes.PLAYLIST}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <ListIcon style={{ paddingRight: "8px" }} />
          {t("Navigation.playlists")}
        </NavLink>
      </MenuItem>
    </Container>
  );
};

export default Navigation;
