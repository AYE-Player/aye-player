import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import CustomSwitch from "../components/Customs/CustomSwitch/CustomSwitch";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import Divider from "../components/Divider/Divider";

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

const InfoText = styled.div`
  position: absolute;
  bottom: 56px;
  right: 8px;
  font-size: 14px;
`;

const AccountPage: React.FunctionComponent = () => {
  const UserStore = ({ app }: RootStoreModel) => ({
    app
  });

  const { app } = useInject(UserStore);

  const _switchRPCStatus = () => {
    app.toggleRPC();
  };

  const _switchMinToTray = () => {
    app.toggleMinimizeToTray();
  }

  return (
    <Container>
      <Header>App Settings</Header>
      <SettingsContainer>
        <CustomSwitch label="Use DiscordRPC" onChange={_switchRPCStatus} checked={app.rpcEnabled} />
        <Divider size={3} />
        <CustomSwitch label="Minimize to Tray*" onChange={_switchMinToTray} checked={app.minimizeToTray} />
      </SettingsContainer>
      <InfoText>*App has to be restarted</InfoText>
    </Container>
  );
};

export default observer(AccountPage);
