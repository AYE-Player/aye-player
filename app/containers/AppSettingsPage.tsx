import { observer } from "mobx-react-lite";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import CustomDropDown from "../components/Customs/CustomDropDown";
import CustomSwitch from "../components/Customs/CustomSwitch";
import Divider from "../components/Divider";
import RootStore from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import { remote } from "electron";
import { version } from "../../package.json";

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
  const store = ({ app, user }: RootStore) => ({
    app,
    user
  });

  const { app, user } = useInject(store);

  const _switchRPCStatus = () => {
    app.toggleRPC();
  };

  const _switchMinToTray = () => {
    app.toggleMinimizeToTray();
  };

  const _activateDevMode = () => {
    app.toggleDevMode();
    remote.getCurrentWindow().reload();
  };

  const [language, setLanguage] = React.useState(app.language);

  const { t } = useTranslation();

  const _handleChange = async (event: React.ChangeEvent<{ value: string }>) => {
    setLanguage(event.target.value);
    app.setLanguage(event.target.value);
  };

  const _switchAutoRadio = () => {
    app.toggleAutoRadio();
  };

  return (
    <Container>
      <Header>{t("AppSettingsPage.header")}</Header>
      <SettingsContainer>
        <CustomSwitch
          label={t("AppSettingsPage.discord")}
          onChange={_switchRPCStatus}
          checked={app.rpcEnabled}
        />
        <Divider size={2} />
        <CustomSwitch
          label={t("AppSettingsPage.tray")}
          onChange={_switchMinToTray}
          checked={app.minimizeToTray}
        />
        <Divider size={2} />
        <CustomSwitch
          label={t("AppSettingsPage.autoRadio")}
          onChange={_switchAutoRadio}
          checked={app.autoRadio}
        />
        <CustomDropDown
          name={t("AppSettingsPage.language")}
          id="language-select"
          options={[
            { value: "en", text: "English" },
            { value: "de", text: "Deutsch" }
          ]}
          selected={language}
          setSelected={setLanguage}
          handleChange={_handleChange}
        />
        {user.roles.find((role: string) => role === "admin") && (
          <>
            <Divider size={2} />
            <CustomSwitch
              label={t("AppSettingsPage.devMode")}
              onChange={_activateDevMode}
              checked={app.devMode}
            />
          </>
        )}
      </SettingsContainer>
        <InfoText>v{version}</InfoText>
    </Container>
  );
};

export default observer(AccountPage);
