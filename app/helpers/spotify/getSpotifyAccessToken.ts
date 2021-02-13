import { remote, BrowserWindow } from "electron";

let win: Maybe<BrowserWindow>;
const clientId = "4f1d7c536d8e4ed384931270fcbfb82f";
const redirectUri = "https://api.aye-playr.de/spotify-catch";

const getSpotifyAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    destroyAuthWin();

    win = new remote.BrowserWindow({
      width: 1000,
      height: 600
    });

    win.loadURL(getAuthenticationURL());

    const filter = {
      urls: [`${redirectUri}`]
    };

    win.webContents.session.webRequest.onBeforeRequest(
      filter,
      ({ url }, callback) => {
        resolve(parseURL(url));
        destroyAuthWin();
      }
    );

    win.on("closed", () => {
      win = null;
    });
  });
};

const parseURL = (url: string) => {
  if (!url.startsWith(redirectUri)) return;
  const query = url.split("#")[1].split("&");
  if (query.find(q => q.startsWith("error"))) return;
  const accessToken = query.find(q => q.startsWith("access_token"))?.split("=")[1];
  // let expiresIn = query.find(q => q.startsWith("expires_in")).split("=")[1];

  return accessToken;
};

const destroyAuthWin = () => {
  if (!win) return;
  win.close();
  win = null;
};

const getAuthenticationURL = () => {
  const scopes = "playlist-read-private playlist-read-collaborative";
  const link = "https://accounts.spotify.com/authorize";
  return `${link}?response_type=token&client_id=${clientId}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;
};

export default getSpotifyAccessToken;
