import { Grid } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import AccountDisplay from "../components/Account/AccountDisplay/AccountDisplay";
import Navigation from "../components/Navigation";
import RootStore from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import Routes from "../Routes";

const StyledGrid = styled(Grid)`
  height: calc(100% - 47px);
  padding: 8px 24px 0 24px;
  width: 100%;
`;

const MainPage: React.FunctionComponent = () => {
  const store = ({ user }: RootStore) => ({
    user
  });

  const { user } = useInject(store);

  return (
    <>
      <StyledGrid
        container
        direction="row"
      >
        {user.isAuthenticated ? (
          <AccountDisplay username={user.name} avatar={user.avatar} email={user.email} />
        ) : <AccountDisplay />}
        <Routes />
      </StyledGrid>
      <Navigation />
    </>
  );
};

export default observer(MainPage);
