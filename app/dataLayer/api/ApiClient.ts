import axios, { AxiosInstance } from "axios";
import Track from "../models/Track";

class ApiClient {
  private axios: AxiosInstance;
  /**
   * Prepares our axios instance, also this checks if a token is present
   * and if a token exists, adds it to every request
   */
  constructor() {
    this.axios = axios.create({
      baseURL: "https://api.aye-player.de/v1"
    });
    this.axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem("token");

        if (token != null) {
          config.headers["x-access-token"] = token;
        }

        return config;
      },
      err => {
        return Promise.reject(err);
      }
    );
  }

  /**
   * Playlist
   */
  getPlaylists() {
    return this.axios.get("/playlists");
  }

  getPlaylist(id: string) {
    return this.axios.get(`/playlists/${id}`);
  }

  createPlaylist(name: string) {
    return this.axios.post("/playlists/", {
      Name: name
    });
  }

  createPlaylistWithSongs(name: string, songs: { Url: string }[]) {
    return this.axios.post("/playlists/by-urls", {
      Name: name,
      Songs: songs
    });
  }

  deletePlaylist(id: string) {
    return this.axios.delete(`/playlists/${id}`);
  }

  getTracksFromPlaylist(id: string, amount: number = 20) {
    return this.axios.get(`/playlists/${id}/songs?skip=0&take=${amount}`);
  }

  addTrackToPlaylist(id: string, track: Track) {
    return this.axios.put(`/playlists/${id}/songs`, {
      Id: track.id,
      Duration: track.duration,
      Title: track.title,
      IsLivestream: track.isLivestream
    });
  }

  addTracksToPlaylistByUrls(id: string, songs: { Url: string }[]) {
    return this.axios.put(`/playlists/${id}/songs/by-urls`, {
      Songs: songs
    });
  }

  removeTrackFromPlaylist(id: string, track: Track) {
    return this.axios.delete(`/playlists/${id}/songs/${track.id}`);
  }

  removeTrackFromPlaylistById(id: string, trackId: string) {
    return this.axios.delete(`/playlists/${id}/songs/${trackId}`);
  }

  moveTrackTo(id: string, trackId: string, index: number) {
    return this.axios.patch(`/playlists/${id}/songs/${trackId}`, [
      {
        op: "replace",
        path: "OrderId",
        value: index
      }
    ]);
  }

  /**
   * User
   */
  register(email: string, password: string) {
    return this.axios.post("/userIdentity/", {
      Email: email,
      Password: password
    });
  }

  authenticate(username: string, password: string) {
    return this.axios.post(`/auth/`, {
      Email: username,
      Password: password
    });
  }

  forgotPassword(email: string) {
    return this.axios.put("/userIdentity/password", {
      Email: email
    });
  }

  getUserdata() {
    return this.axios.get("/userIdentity/");
  }

  updatePassword(password: string) {
    return this.axios.patch("https://api.aye-player.de/v1/userIdentity", [
      { op: "replace", path: "/Password", value: password }
    ]);
  }

  // INFO: We have to use fetch here, because axios has problems with formData uploads/requests...
  updateAvatar(data: FormData) {
    return fetch("https://api.aye-player.de/v1/userIdentity/avatar", {
      method: "POST",
      body: data,
      headers: {
        "x-access-token": localStorage.getItem("token")
      }
    });
  }

  updateAvatarUrl(url: string) {
    return axios.patch("/userIdentity/", [
      { op: "replace", path: "/Avatar", value: url }
    ]);
  }

  deleteUser() {
    return this.axios.delete("/userIdentity/");
  }

  /**
   * Search
   */
  searchTrack(term: string) {
    return axios.get(`https://api.aye-player.de/v1/search/${term}`);
  }

  getTrackFromUrl(url: string) {
    return axios.get(
      `https://api.aye-player.de/v1/search/song?songUrl=${encodeURIComponent(
        url
      )}`
    );
  }
}

export default new ApiClient();
