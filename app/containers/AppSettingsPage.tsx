import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import CustomSwitch from "../components/Customs/CustomSwitch/CustomSwitch";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";
import Divider from "../components/Divider/Divider";
import CustomDropDown from "../components/Customs/CustomDropDown/CustomDropDown";
import { useTranslation } from "react-i18next";

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
  };

  const [language, setLanguage] = React.useState(app.language);

  const { t } = useTranslation();

  const _handleChange = async (event: React.ChangeEvent<{ value: string }>) => {
    setLanguage(event.target.value);
    app.setLanguage(event.target.value);
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
      </SettingsContainer>
      <InfoText>{t("AppSettingsPage.infoText")}</InfoText>
    </Container>
  );
};

export default observer(AccountPage);
