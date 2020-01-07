import ky from "ky/umd";
import Track from "../models/Track";
import { ITrackDto, IUserInfoDto, IPlaylistDto } from "../../types/response";

class ApiClient {
  private ky: typeof ky;
  /**
   * Prepares our ky instance, also this checks if a token is present
   * and if a token exists, adds it to every request
   */
  constructor() {
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
  }

  /**
   * Playlist
   */
  async getPlaylists(): Promise<IPlaylistDto[]> {
    return this.ky.get(`playlists/`).json();
  }

  async getPlaylist(id: string): Promise<IPlaylistDto> {
    return this.ky.get(`playlists/${id}`).json();
  }

  async createPlaylist(name: string): Promise<string> {
    return this.ky.post(`playlists/`, {
      json: {
        Name: name
      }
    }).json();
  }

  async createPlaylistWithSongs(name: string, songs: { Url: string }[]): Promise<string> {
    return this.ky.post("playlists/by-urls", {
      json: {
        Name: name,
        Songs: songs
      }
    }).json();
   }

  async deletePlaylist(id: string) {
    return this.ky.delete(`playlists/${id}`);
  }

  async getTracksFromPlaylist(id: string, amount: number = 20): Promise<ITrackDto[]> {
    return this.ky.get(
      `playlists/${id}/songs?skip=0&take=${amount}`
    ).json();
  }

  async addTrackToPlaylist(id: string, track: Track) {
    return this.ky.put(`playlists/${id}/songs`, {
      json: {
        Id: track.id,
        Duration: track.duration,
        Title: track.title,
        IsLivestream: track.isLivestream
      }
    });
  }

  async addTracksToPlaylistByUrls(id: string, songs: { Url: string }[]) {
    return this.ky.put(`playlists/${id}/songs/by-urls`, {
      json: {
        Songs: songs
      }
    });
  }

  async removeTrackFromPlaylist(id: string, track: Track) {
    return this.ky.delete(`playlists/${id}/songs/${track.id}`);
  }

  async removeTrackFromPlaylistById(id: string, trackId: string) {
    return this.ky.delete(`playlists/${id}/songs/${trackId}`);
  }

  async moveTrackTo(id: string, trackId: string, index: number) {
    return this.ky.patch(`playlists/${id}/songs/${trackId}`, {
      json: [
        {
          op: "replace",
          path: "OrderId",
          value: index
        }
      ]
    });
  }

  /**
   * User
   */
  async register(email: string, password: string) {
    return this.ky.post("userIdentity/", {
      json: {
        Email: email,
        Password: password
      }
    });
  }

  async authenticate(username: string, password: string): Promise<string> {
    return this.ky.post("auth/", {
      json: {
        Email: username,
        Password: password
      }
    }).json();
  }

  async forgotPassword(email: string) {
    return this.ky.put("userIdentity/password", {
      json: {
        Email: email
      }
    });
  }

  async getUserdata(): Promise<IUserInfoDto> {
    return this.ky.get("userIdentity/").json();
  }

  async updatePassword(password: string) {
    return this.ky.patch("userIdentity/", {
      json: [
        {
          op: "replace",
          path: "/Password",
          value: password
        }
      ]
    });
  }

  async updateAvatar(data: FormData): Promise<string> {
    return await this.ky.post("userIdentity/avatar", {
      body: data
    }).json();
  }

  async updateAvatarUrl(url: string) {
    return this.ky.patch("userIdentity/", {
      json: [
        {
          op: "replace",
          path: "/Avatar",
          value: url
        }
      ]
    });
  }

  async deleteUser() {
    return this.ky.delete("userIdentity/");
  }

  /**
   * Search
   */
  async searchTrack(term: string): Promise<ITrackDto[]> {
    return this.ky.get(`search/${term}`).json();
  }

  async getTrackFromUrl(url: string): Promise<ITrackDto> {
    return this.ky.get(
      `search/song?songUrl=${encodeURIComponent(url)}`
    ).json();
  }
}

export default new ApiClient();
