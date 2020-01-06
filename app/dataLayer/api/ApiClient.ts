// import axios, { AxiosInstance } from "axios";
import ky from "ky/umd";
import Track from "../models/Track";

class ApiClient {
  // private axios: AxiosInstance;
  private ky: typeof ky;
  /**
   * Prepares our axios instance, also this checks if a token is present
   * and if a token exists, adds it to every request
   */
  constructor() {
    /*     this.axios = axios.create({
      baseURL: "https://api.aye-player.de/v1",
      timeout: 5000
    }); */
    /*     this.ky = ky.create({
      prefixUrl: "https://api.aye-player.de/v1/",
      timeout: 5000
    }); */
    this.ky = ky.extend({
      prefixUrl: "https://api.aye-player.de/v1/",
      timeout: 5000,
      hooks: {
        beforeRequest: [
          request => {
            const token = localStorage.getItem("token");

            if (token != null) {
              request.headers.set("x-access-token", token);
            }
          }
        ]
      }
    });
    /*     this.axios.interceptors.request.use(
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
    ); */
  }

  /**
   * Playlist
   */
  async getPlaylists() {
    const res = await this.ky.get(`playlists/`);
    return await res.json();
    // return this.axios.get(`/playlists/`);
  }

  async getPlaylist(id: string) {
    const res = await this.ky.get(`playlists/${id}`);
    return await res.json();
    // return this.axios.get(`/playlists/${id}`);
  }

  async createPlaylist(name: string) {
    const res = await this.ky.post(`playlists/`, {
      json: {
        Name: name
      }
    });
    return await res.json();
    /* return this.axios.post("/playlists/", {
      Name: name
    }); */
  }

  async createPlaylistWithSongs(name: string, songs: { Url: string }[]) {
    const res = await this.ky.post("playlists/by-urls", {
      json: {
        Name: name,
        Songs: songs
      }
    });
    return await res.json();
    /*     return this.axios.post("/playlists/by-urls", {
      Name: name,
      Songs: songs
    }); */
  }

  async deletePlaylist(id: string) {
    return await this.ky.delete(`playlists/${id}`);
    // return this.axios.delete(`/playlists/${id}`);
  }

  async getTracksFromPlaylist(id: string, amount: number = 20) {
    const res = await this.ky.get(
      `playlists/${id}/songs?skip=0&take=${amount}`
    );
    return await res.json();
    // return this.axios.get(`/playlists/${id}/songs?skip=0&take=${amount}`);
  }

  async addTrackToPlaylist(id: string, track: Track) {
    const res = await this.ky.put(`playlists/${id}/songs`, {
      json: {
        Id: track.id,
        Duration: track.duration,
        Title: track.title,
        IsLivestream: track.isLivestream
      }
    });
    return await res.json();
    /*     return this.axios.put(`/playlists/${id}/songs`, {
      Id: track.id,
      Duration: track.duration,
      Title: track.title,
      IsLivestream: track.isLivestream
    }); */
  }

  async addTracksToPlaylistByUrls(id: string, songs: { Url: string }[]) {
    const res = await this.ky.put(`playlists/${id}/songs/by-urls`, {
      json: {
        Songs: songs
      }
    });
    return await res.json();
    /* return this.axios.put(`/playlists/${id}/songs/by-urls`, {
      Songs: songs
    }); */
  }

  async removeTrackFromPlaylist(id: string, track: Track) {
    return await this.ky.delete(`playlists/${id}/songs/${track.id}`);
    // return this.axios.delete(`/playlists/${id}/songs/${track.id}`);
  }

  async removeTrackFromPlaylistById(id: string, trackId: string) {
    return await this.ky.delete(`playlists/${id}/songs/${trackId}`);
    // return this.axios.delete(`/playlists/${id}/songs/${trackId}`);
  }

  async moveTrackTo(id: string, trackId: string, index: number) {
    const res = await this.ky.patch(`playlists/${id}/songs/${trackId}`, {
      json: [
        {
          op: "replace",
          path: "OrderId",
          value: index
        }
      ]
    });
    return await res.json();
    /*     return this.axios.patch(`/playlists/${id}/songs/${trackId}`, [
      {
        op: "replace",
        path: "OrderId",
        value: index
      }
    ]); */
  }

  /**
   * User
   */
  async register(email: string, password: string) {
    const res = await this.ky.post("userIdentity/", {
      json: {
        Email: email,
        Password: password
      }
    });
    return await res.json();
    /*     return this.axios.post("/userIdentity/", {
      Email: email,
      Password: password
    }); */
  }

  async authenticate(username: string, password: string) {
    const res = await this.ky.post("auth/", {
      json: {
        Email: username,
        Password: password
      }
    });
    return await res.json();
    /* return this.axios.post(`/auth/`, {
      Email: username,
      Password: password
    }); */
  }

  async forgotPassword(email: string) {
    const res = await this.ky.put("userIdentity/password", {
      json: {
        Email: email
      }
    });
    return await res.json();
    /* return this.axios.put("/userIdentity/password", {
      Email: email
    }); */
  }

  async getUserdata() {
    const res = await this.ky.get("userIdentity/");
    return await res.json();
    // return this.axios.get("/userIdentity/");
  }

  async updatePassword(password: string) {
    const res = await this.ky.patch("userIdentity/", {
      json: [
        {
          op: "replace",
          path: "/Password",
          value: password
        }
      ]
    });
    return await res.json();
    /* return this.axios.patch("https://api.aye-player.de/v1/userIdentity", [
      { op: "replace", path: "/Password", value: password }
    ]); */
  }

  // INFO: We have to use fetch here, because axios has problems with formData uploads/requests...
  async updateAvatar(data: FormData) {
    const res = await this.ky.post("userIdentity/avatar", {
      body: data
    });
    return await res.json();
    /*     return fetch("https://api.aye-player.de/v1/userIdentity/avatar", {
      method: "POST",
      body: data,
      headers: {
        "x-access-token": localStorage.getItem("token")
      }
    }); */
  }

  async updateAvatarUrl(url: string) {
    return await this.ky.patch("userIdentity/", {
      json: [
        {
          op: "replace",
          path: "/Avatar",
          value: url
        }
      ]
    });
    /*     return axios.patch("/userIdentity/", [
      { op: "replace", path: "/Avatar", value: url }
    ]); */
  }

  async deleteUser() {
    return this.ky.delete("userIdentity/");
    // return this.axios.delete("/userIdentity/");
  }

  /**
   * Search
   */
  async searchTrack(term: string) {
    const res = await this.ky.get(`search/${term}`);
    return await res.json();
    // return axios.get(`https://api.aye-player.de/v1/search/${term}`);
  }

  async getTrackFromUrl(url: string) {
    const res = await this.ky.get(
      `search/song?songUrl=${encodeURIComponent(url)}`
    );
    return await res.json();
    /*    return axios.get(
      `https://api.aye-player.de/v1/search/song?songUrl=${encodeURIComponent(
        url
      )}`
    ); */
  }
}

export default new ApiClient();
