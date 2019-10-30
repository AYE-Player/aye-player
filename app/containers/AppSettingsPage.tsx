import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import CustomSwitch from "../components/Customs/CustomSwitch/CustomSwitch";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Container = styled.div``;

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-items: center;
  padding: 40px;
`;

const AccountPage: React.FunctionComponent = () => {
  const UserStore = ({ app }: RootStoreModel) => ({
    app
  });

  const { app } = useInject(UserStore);

  const _switchRPCStatus = () => {
    app.toggleRPC();
  };

  return (
    <Container>
      <Header>App Settings</Header>
      <SettingsContainer>
        <CustomSwitch label="Use DiscordRPC" onChange={_switchRPCStatus} checked={app.rpcEnabled} />
      </SettingsContainer>
    </Container>
  );
};

export default observer(AccountPage);
