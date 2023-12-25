import { Grid } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React from 'react';
import styled from 'styled-components';
import AccountDisplay from '../components/Account/AccountDisplay/AccountDisplay';
import Navigation from '../components/Navigation';
import { useStore } from '../components/StoreProvider';
import Routes from '../Routes';

const StyledGrid = styled(Grid)`
  height: calc(100% - 32px);
  padding: 8px 24px 0 24px;
  width: 100%;
`;

const MainPage: React.FunctionComponent = () => {
  const { user } = useStore();

  return (
    <>
      <StyledGrid container direction="row">
        {user.isAuthenticated ? (
          <AccountDisplay
            username={user.name!}
            avatar={user.avatar!}
            email={user.email!}
          />
        ) : (
          <AccountDisplay />
        )}
        <Routes />
      </StyledGrid>
      <Navigation />
    </>
  );
};

export default observer(MainPage);
