import React from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

import Routes from "../Routes";
import Navigation from "../components/Navigation/Navigation";
import AccountDisplay from "../components/AccountDisplay/AccountDisplay";
import { RootStoreModel } from "../stores/RootStore";
import useInject from "../hooks/useInject";
import { Grid } from "@material-ui/core";

const StyledGrid = styled(Grid)`
  height: calc(100% - 47px);
  padding: 8px;
  width: 100%;
`;

const MainPage: React.FunctionComponent = () => {
  const UserStore = ({ user }: RootStoreModel) => ({
    user: user
  });

  const { user } = useInject(UserStore);

  return (
    <>
      <StyledGrid
        container
        direction="column"
      >
        {user.isAuthenticated ? (
          <AccountDisplay username={user.name} avatar={user.avatar} />
        ) : null}
        <Routes />
      </StyledGrid>
      <Navigation />
    </>
  );
};

export default observer(MainPage);
