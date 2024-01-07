import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ControlPoint from '@mui/icons-material/ControlPoint';
import { observer } from 'mobx-react-lite';
import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { routes } from 'renderer/constants';
import { getPlaylists } from 'renderer/dataLayer/api/fetchers';
import { Channel } from '../../types/enums';
import CustomButton from '../components/Customs/CustomButton';
import CustomTextareaDialog from '../components/Customs/CustomTextareaDialog';
import SnackMessage from '../components/Customs/SnackMessage';
import Divider from '../components/Divider';
import PlaylistWithMultiSongDialog from '../components/Playlist/PlaylistWithMultiSongDialog';
import PlaylistPageMenu from '../components/PlaylistPageMenu';
import { useStore } from '../components/StoreProvider';
import Playlist from '../dataLayer/models/Playlist';
import Track from '../dataLayer/models/Track';
import { formattedDuration, removeControlCharacters } from '../../helpers';

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

// Im not 100% sure, why we need the 42px here,
// but it looks good now
const Container = styled.div`
  height: calc(100% - 42px);
  width: 100%;
`;

const PlaylistContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ScrollContainer = styled.div`
  overflow: auto;
  height: calc(100% - 72px);
`;

const PlaylistPage: React.FunctionComponent = () => {
  const [newPlaylistName, setNewPlaylistName] = React.useState('');
  const [newPlaylistSongs, setNewPlaylistSongs] = React.useState<
    { url: string }[]
  >([]);
  const [open, setOpen] = React.useState(false);
  const [addTracksOpen, setAddTracksOpen] = React.useState(false);
  const [songsToAdd, setSongsToAdd] = React.useState<{ url: string }[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = React.useState<
    string | undefined
  >(undefined);

  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { playlists, trackCache, user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const token = localStorage.getItem('token');
    if (token) {
      getPlaylists()
        .then((data) => {
          // eslint-disable-next-line promise/always-return
          for (const playlist of data) {
            const oldPl = playlists.lists.find(
              (list) => list.id === playlist.id,
            );
            // eslint-disable-next-line no-continue
            if (oldPl && playlist.songs?.length !== oldPl.trackCount) continue;
            const pl = new Playlist({
              id: playlist.id,
              name: playlist.name,
              trackCount: playlist.songCount,
              duration: playlist.duration,
              tracks: [],
            });
            if (playlist.songs) {
              for (const track of playlist.songs) {
                const tr = new Track({
                  id: track.id,
                  title: track.title,
                  duration: track.duration,
                });
                if (!trackCache.getTrackById(track.id)) {
                  trackCache.add(tr);
                }
                pl.addLoadedTrack(tr);
              }
            }

            playlists.add(pl);
          }
        })
        .catch((error) => {
          window.electron.ipcRenderer.sendMessage(Channel.LOG, {
            message: `[PlaylistPage] Error retrieving Playlists ${error}`,

            type: 'error',
          });
          enqueueSnackbar('', {
            content: (key) => (
              <SnackMessage
                id={key}
                variant="error"
                message={`${t('Error.getPlaylists')}`}
              />
            ),
          });
        });
    }

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createPlaylist = async () => {
    setOpen(false);
    try {
      if (newPlaylistSongs.length > 0) {
        await playlists.createListWithSongs(newPlaylistName, newPlaylistSongs);
      } else {
        await playlists.createList(newPlaylistName);
      }
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error creating Playlist ${JSON.stringify(error, null, 2)}`,

        type: 'error',
      });
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="error"
            message={`${t('Playlist.couldNotCreate')}`}
          />
        ),
      });
    }
  };

  const handleOnClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddTracksClose = () => {
    setAddTracksOpen(false);
  };

  const onPlaylistNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewPlaylistName(event.target.value);
  };

  const onPlaylistSongsChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNewPlaylistSongs(
      removeControlCharacters(event.target.value)
        .split(',')
        .map((url) => ({
          url,
        })),
    );
  };

  const onAddTracksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSongsToAdd(
      removeControlCharacters(event.target.value)
        .split(',')
        .map((url) => ({
          url,
        })),
    );
  };

  const addTracksToPlaylist = async () => {
    const playlist = playlists.getListById(selectedPlaylist!);
    try {
      setAddTracksOpen(false);
      await playlist!.addTracksByUrls(songsToAdd);
    } catch (error) {
      window.electron.ipcRenderer.sendMessage(Channel.LOG, {
        message: `Error adding tracks to playlist ${
          playlist!.id
        } ${JSON.stringify(error, null, 2)}`,

        type: 'error',
      });
      enqueueSnackbar('', {
        content: (key) => (
          <SnackMessage
            id={key}
            variant="error"
            message={`${t('Error.couldNotAddTrack')}`}
          />
        ),
      });
    }
  };

  const renderPlaylists = () => (
    <Container>
      <Header>Playlists</Header>
      <PlaylistContainer>
        <ScrollContainer>
          <Table
            aria-label="playlist table"
            style={{ minWidth: '400px' }}
            stickyHeader
          >
            <TableHead>
              <TableRow>
                <TableCell
                  style={{
                    color: '#f2f5f4',
                    backgroundColor: '#3d4653',
                    borderBottom: 'none',
                  }}
                >
                  {t('PlaylistPage.name')}
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    color: '#f2f5f4',
                    backgroundColor: '#3d4653',
                    borderBottom: 'none',
                  }}
                >
                  {t('PlaylistPage.tracks')}
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    color: '#f2f5f4',
                    backgroundColor: '#3d4653',
                    borderBottom: 'none',
                  }}
                >
                  {t('PlaylistPage.length')}
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    color: '#f2f5f4',
                    backgroundColor: '#3d4653',
                    borderBottom: 'none',
                  }}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {playlists.lists.map((playlist) => (
                <TableRow key={playlist.id}>
                  <TableCell component="th" scope="row">
                    <Link
                      to={`/playlist/${playlist.id}`}
                      style={{ color: '#f2f5f4', opacity: 1 }}
                    >
                      {playlist.name}
                    </Link>
                  </TableCell>
                  <TableCell align="right" style={{ color: '#f2f5f4' }}>
                    {playlist.trackCount}
                  </TableCell>
                  <TableCell align="right" style={{ color: '#f2f5f4' }}>
                    {formattedDuration(playlist.duration)}
                  </TableCell>
                  <TableCell style={{ color: '#f2f5f4' }}>
                    <PlaylistPageMenu
                      id={playlist.id}
                      handleAddTracksToList={() => setAddTracksOpen(true)}
                      setSelectedPlaylist={setSelectedPlaylist}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollContainer>
        <PlaylistWithMultiSongDialog
          id="createPlaylistDialog"
          title={t('PlaylistPage.dialog.title')}
          label={t('PlaylistPage.dialog.label')}
          button={
            <CustomButton
              onClick={handleOnClick}
              style={{
                width: '206px',
                height: '40px',
                position: 'absolute',
                bottom: '56px',
                right: '16px',
              }}
            >
              {t('PlaylistPage.dialog.title')}
              <ControlPoint style={{ marginLeft: '8px' }} />
            </CustomButton>
          }
          dialogText={t('PlaylistPage.dialog.text')}
          open={open}
          handleClose={handleClose}
          handleConfirm={createPlaylist}
          handleChange={onPlaylistNameChange}
          confirmButtonText={t('PlaylistPage.dialog.confirmButton')}
          cancelButtonText={t('PlaylistPage.dialog.cancelButton')}
          type="text"
          textField={{
            placeholder: 'https://www.youtube.com/watch?v=A3rvyaZFCN4',
            label: t('PlaylistPage.dialog.textField.label'),
            dialogText: t('PlaylistPage.dialog.textField.dialogText'),
          }}
          handleSongsChange={onPlaylistSongsChange}
        />
        <CustomTextareaDialog
          id="addTracksDialog"
          // eslint-disable-next-line react/jsx-no-useless-fragment
          button={<></>}
          title={t('PlaylistPage.addTracks.title')}
          label={t('PlaylistPage.addTracks.label')}
          dialogText={t('PlaylistPage.addTracks.text')}
          open={addTracksOpen}
          handleClose={handleAddTracksClose}
          handleChange={onAddTracksChange}
          handleConfirm={addTracksToPlaylist}
          confirmButtonText={t('PlaylistPage.addTracks.confirmButton')}
          cancelButtonText={t('PlaylistPage.addTracks.cancelButton')}
          type="text"
          placeholder="https://www.youtube.com/watch?v=A3rvyaZFCN4"
        />
      </PlaylistContainer>
    </Container>
  );

  return playlists.lists.length > 0 ? (
    renderPlaylists()
  ) : (
    <Container>
      <Header>Playlists</Header>
      <PlaylistContainer>
        {user.isAuthenticated ? (
          <>
            {t('PlaylistPage.noPlaylist')}
            <PlaylistWithMultiSongDialog
              id="createPlaylistDialog"
              title={t('PlaylistPage.dialog.title')}
              label={t('PlaylistPage.dialog.label')}
              button={
                <CustomButton
                  onClick={handleOnClick}
                  style={{
                    width: '197px',
                    height: '40px',
                    position: 'absolute',
                    bottom: '56px',
                    right: '24px',
                  }}
                >
                  {t('PlaylistPage.dialog.title')}
                  <ControlPoint style={{ marginLeft: '16px' }} />
                </CustomButton>
              }
              dialogText={t('PlaylistPage.dialog.text')}
              open={open}
              handleClose={handleClose}
              handleConfirm={createPlaylist}
              handleChange={onPlaylistNameChange}
              confirmButtonText={t('PlaylistPage.dialog.confirmButton')}
              cancelButtonText={t('PlaylistPage.dialog.cancelButton')}
              type="text"
              textField={{
                placeholder: 'https://www.youtube.com/watch?v=A3rvyaZFCN4',
                label: t('PlaylistPage.dialog.textField.label'),
                dialogText: t('PlaylistPage.dialog.textField.dialogText'),
              }}
              handleSongsChange={onPlaylistSongsChange}
            />
          </>
        ) : (
          <>
            {t('PlaylistPage.notAuthenticated')}
            <Divider size={2} />
            <CustomButton
              onClick={() => {
                navigate(routes.REGISTER);
              }}
              style={{
                width: '200px',
              }}
            >
              {t('PlaylistPage.createAccount')}
            </CustomButton>
            <Divider size={2} />
            <CustomButton
              onClick={() => {
                navigate(routes.LOGIN);
              }}
              style={{
                width: '200px',
              }}
            >
              {t('PlaylistPage.login')}
            </CustomButton>
          </>
        )}
      </PlaylistContainer>
    </Container>
  );
};

export default observer(PlaylistPage);
