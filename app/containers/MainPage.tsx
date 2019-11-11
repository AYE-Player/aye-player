import { Grid } from "@material-ui/core";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import AccountDisplay from "../components/Account/AccountDisplay/AccountDisplay";
import Navigation from "../components/Navigation/Navigation";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import Routes from "../Routes";

const StyledGrid = styled(Grid)`
  height: calc(100% - 47px);
  padding: 8px 0 0 24px;
  width: 100%;
`;

const MainPage: React.FunctionComponent = () => {
  const UserStore = ({ user }: RootStoreModel) => ({
    user
  });

  const { user } = useInject(UserStore);

  return (
    <>
      <StyledGrid
        container
        direction="column"
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
