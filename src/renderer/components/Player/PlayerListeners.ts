import Root from 'renderer/containers/Root';
import PlayerInterop from 'renderer/dataLayer/api/PlayerInterop';
import Track from 'renderer/dataLayer/models/Track';
import { Channel, Repeat } from 'types/enums';

// Listeners
window.electron.ipcRenderer.on(Channel.PLAY_PAUSE, () => {
  const { queue, player } = Root.stores;

  if (queue.isEmpty) {
    queue.addTracks(
      player.currentPlaylist!.current.tracks.map((track) => track.current)
    );
    player.playTrack(queue.currentTrack!.current);
    PlayerInterop.playTrack(queue.currentTrack!.current);
  }

  player.togglePlayingState();
  PlayerInterop.togglePlayingState();
});

window.electron.ipcRenderer.on(Channel.PLAY_NEXT, () => {
  const { queue, player, trackHistory } = Root.stores;
  const prevTrack = player.currentTrack;
  const track = queue.nextTrack();

  if (!track) {
    if (player.repeat === Repeat.PLAYLIST && player.isShuffling) {
      queue.addTracks(
        player.currentPlaylist!.current.tracks.map((cpTrack) => cpTrack.current)
      );
      queue.shuffel();
      player.playTrack(queue.currentTrack!.current);
      PlayerInterop.playTrack(queue.currentTrack!.current);
    } else if (player.repeat === Repeat.PLAYLIST) {
      queue.addTracks(
        player.currentPlaylist!.current.tracks.map((cpTrack) => cpTrack.current)
      );
      player.playTrack(player.currentPlaylist!.current.tracks[0].current);
      PlayerInterop.playTrack(
        player.currentPlaylist!.current.tracks[0].current
      );
    } else {
      player.togglePlayingState();
      PlayerInterop.togglePlayingState();
    }
    return;
  }

  if (player.currentTrack) {
    trackHistory.addTrack(prevTrack!.current);
  }
  player.playTrack(track.current);
  PlayerInterop.playTrack(track.current);
});

window.electron.ipcRenderer.on(Channel.PLAY_SONG, async (message) => {
  try {
    const { queue, player, trackHistory, trackCache, searchResult } =
      Root.stores;
    const prevTrack = player.currentTrack;

    const trackInfo = await searchResult.getTrackFromUrl(
      `https://www.youtube.com/watch?v=${message.id}`
    );

    let track: Track;
    if (!trackCache.getTrackById(trackInfo.id)) {
      track = new Track({
        id: trackInfo.id,
        duration: trackInfo.duration,
        title: trackInfo.title,
      });
      trackCache.add(track);
    } else {
      track = trackCache.getTrackById(trackInfo.id)!;
    }

    if (player.currentTrack) {
      trackHistory.addTrack(prevTrack!.current);
    }
    queue.addPrivilegedTrack(track);
    player.playTrack(track);
    PlayerInterop.playTrack(track);
  } catch (error) {
    window.electron.ipcRenderer.sendMessage(Channel.LOG, {
      message: `Error playing track ${JSON.stringify(error, null, 2)}`,

      type: 'error',
    });
  }
});

window.electron.ipcRenderer.on(Channel.PLAY_PREVIOUS, () => {
  const { player, queue, trackHistory } = Root.stores;
  const track = trackHistory.removeAndGetTrack();
  if (!track) return;

  queue.addPrivilegedTrack(player.currentTrack!.current);

  player.playTrack(track);
  PlayerInterop.playTrack(track);
});

window.electron.ipcRenderer.on(
  Channel.POSITION,
  (_event: any, message: { pos: number }) => {
    PlayerInterop.seekTo(message.pos);
  }
);

window.electron.ipcRenderer.on(Channel.RECONNECT_STREAM, () => {
  const { player } = Root.stores;
  player.setPlaying(false);
  setTimeout(() => player.setPlaying(true), 3000);
  PlayerInterop.reconnectLivestream();
});
