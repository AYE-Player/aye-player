/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import CustomButton from 'renderer/components/Customs/CustomButton';
import ApiClient from 'renderer/dataLayer/api/ApiClient';
import { Channel } from '../../types/enums';
import CustomSwitch from '../components/Customs/CustomSwitch';
import Divider from '../components/Divider';
import { useStore } from '../components/StoreProvider';

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 6rem;
`;

const Container = styled.div``;

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10rem;
`;

const InfoText = styled.div`
  font-size: 12px;
`;
const SettingsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AdminPage: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const { app, player } = useStore();

  const [inviteCode, setInviteCode] = useState<string>();

  const activateDevMode = () => {
    app.toggleDevMode();
    window.electron.ipcRenderer.sendMessage(Channel.RELOAD_MAIN_WINDOW);
  };

  const deselectTrack = () => {
    player.setCurrentTrack();
  };

  const deselectPlaylist = () => {
    player.setCurrentPlaylist();
  };

  const generateInviteCode = async () => {
    try {
      const token = await ApiClient.generateInviteCode();
      setInviteCode(token);
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error creating invite token ${JSON.stringify(
          error,
          null,
          2
        )}`,
        type: 'error',
      });
    }
  };

  return (
    <Container>
      <Header>{t('AdminPage.header')}</Header>
      <SettingsContainer>
        <SettingsColumn>
          <CustomSwitch
            label={t('AdminPage.devMode')}
            onChange={activateDevMode}
            checked={app.devMode}
          />
          <Divider size={2} />
          <CustomButton
            key="deselectTrack"
            onClick={deselectTrack}
            name="Deselect Track"
          />
          <Divider size={2} />
          <CustomButton
            key="deselectPlaylist"
            onClick={deselectPlaylist}
            name="Deselect Playlist"
          />
          <Divider size={2} />
          <CustomButton
            onClick={generateInviteCode}
            name="Generate Invite Code"
          />
          {inviteCode && (
            <>
              <Divider size={2} />
              {inviteCode}
            </>
          )}
        </SettingsColumn>
      </SettingsContainer>
      <div
        style={{
          position: 'absolute',
          bottom: '56px',
          right: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '184px',
        }}
      >
        <InfoText>App v{process.env.version}</InfoText>
        <InfoText>externalPlayer v{player.externalPlayerVersion}</InfoText>
      </div>
    </Container>
  );
};

export default observer(AdminPage);
