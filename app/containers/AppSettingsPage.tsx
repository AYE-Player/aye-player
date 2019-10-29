import { observer } from "mobx-react-lite";
import React from "react";
import Switch from "react-switch";
import styled from "styled-components";
import CustomSwitch from "../components/Customs/CustomSwitch/CustomSwitch";
import Divider from "../components/Divider/Divider";
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
        <Divider size={3} />
        <label
          style={{
            display: "flex",
            alignItems: "center",
            width: "200px",
            justifyContent: "space-between"
          }}
        >
          <Switch
            onChange={() => console.log("LDL")}
            checked={app.rpcEnabled}
            onColor="#99ccff"
            onHandleColor="#565f6c"
            handleDiameter={30}
            uncheckedIcon={false}
            checkedIcon={false}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={20}
            width={48}
          />
          <span>Test</span>
        </label>
        <Divider size={3} />
        <label
          style={{
            display: "flex",
            alignItems: "center",
            width: "200px",
            justifyContent: "space-between"
          }}
        >
          <Switch
            onChange={() => console.log("LDL")}
            checked={app.rpcEnabled}
            onColor="#99ccff"
            onHandleColor="#565f6c"
            handleDiameter={30}
            uncheckedIcon={false}
            checkedIcon={false}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={20}
            width={48}
          />
          <span>Test 2</span>
        </label>
        <Divider size={3} />

      </SettingsContainer>
    </Container>
  );
};

export default observer(AccountPage);
