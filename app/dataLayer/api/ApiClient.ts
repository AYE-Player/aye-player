import ky from "ky/umd";
import Track from "../models/Track";
import { ITrackDto, IUserInfoDto, IPlaylistDto } from "../../types/response";

/**
 * Manages all requests to the aye-player backend
 */
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
   * Retrieves all Playlists of the current user
   */
  async getPlaylists(): Promise<IPlaylistDto[]> {
    return this.ky.get(`playlists/`).json();
  }

  /**
   * Retrieves a specific playlist of the current user
   * @param id id of the playlist
   */
  async getPlaylist(id: string): Promise<IPlaylistDto> {
    return this.ky.get(`playlists/${id}`).json();
  }

  /**
   * Creates a new playlist
   * @param name Name of the new playlist
   */
  async createPlaylist(name: string): Promise<string> {
    return this.ky
      .post(`playlists/`, {
        json: {
          Name: name
        }
      })
      .json();
  }

  /**
   * Creates a new playlist and directly adds new songs to it
   * @param name Name of the new playlist
   * @param songs Urls of Songs which should be added to the inital playlist
   */
  async createPlaylistWithSongs(
    name: string,
    songs: { Url: string }[]
  ): Promise<string> {
    return this.ky
      .post("playlists/by-urls", {
        json: {
          Name: name,
          Songs: songs
        }
      })
      .json();
  }

  /**
   * Deletes given playlist
   * @param id id of the playlist
   */
  async deletePlaylist(id: string) {
    return this.ky.delete(`playlists/${id}`);
  }

  /**
   * Retrieves the given amount of Tracks of a playlist
   * @param id id of the playlist
   * @param amount amount of tracks to retrieve
   */
  async getTracksFromPlaylist(
    id: string,
    amount: number = 20
  ): Promise<ITrackDto[]> {
    return this.ky.get(`playlists/${id}/songs?skip=0&take=${amount}`).json();
  }

  /**
   * Adds the given track to the playlist
   * @param id id of the playlist
   * @param track MobX cached Track
   */
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

  /**
   * Adds given tracks to the playlist
   * @param id id of the playlist
   * @param songs array of youtube urls to be added to the playlist
   */
  async addTracksToPlaylistByUrls(id: string, songs: { Url: string }[]) {
    return this.ky.put(`playlists/${id}/songs/by-urls`, {
      json: {
        Songs: songs
      }
    });
  }

  /**
   * Deletes the given track from the playlist
   * @param id id of the playlist
   * @param track Mobx cached Track
   */
  async removeTrackFromPlaylist(id: string, track: Track) {
    return this.ky.delete(`playlists/${id}/songs/${track.id}`);
  }

  /**
   * Deletes given track from playlist by id
   * @param id id of the playlist
   * @param trackId id of the track
   */
  async removeTrackFromPlaylistById(id: string, trackId: string) {
    return this.ky.delete(`playlists/${id}/songs/${trackId}`);
  }

  /**
   * Moves a track from a playlist to a new position
   * @param id id of the playlist
   * @param trackId if of the track
   * @param index position to move to
   */
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
   * Registeres a new User
   * @param email email of the user
   * @param password password of the user
   */
  async register(username: string, email: string, password: string) {
    return this.ky.post("userIdentity/", {
      json: {
        Email: email,
        Password: password,
        Username: username
      }
    });
  }

  /**
   * Tries to authenticate the given user with the given password
   * @param email email of the user
   * @param password password of the user
   */
  async authenticate(email: string, password: string): Promise<string> {
    return this.ky
      .post("auth/", {
        json: {
          Email: email,
          Password: password
        }
      })
      .json();
  }

  /**
   * Starts the forgot password process
   * @param email email of the account
   */
  async forgotPassword(email: string) {
    return this.ky.put("userIdentity/password", {
      json: {
        Email: email
      }
    });
  }

  /**
   * Retrive the userdata of the logged in user
   */
  async getUserdata(): Promise<IUserInfoDto> {
    return this.ky.get("userIdentity/").json();
  }

  /**
   * Update the password of the logged in user
   * @param password new password
   */
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

  /**
   * Updates (uploades) the avatar of the logged in user
   * @param data FormData containing the new avatar
   */
  async updateAvatar(data: FormData): Promise<string> {
    return await this.ky
      .post("userIdentity/avatar", {
        body: data
      })
      .json();
  }

  /**
   * Updates the userprofile with the new avatar
   * @param url url of avatar
   */
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

  /**
   * Deletes the logged in user
   */
  async deleteUser() {
    return this.ky.delete("userIdentity/");
  }

  /**
   * Retrieves videos from youtube for the given search term
   * @param term term to search youtube videos for
   */
  async searchTrack(term: string): Promise<ITrackDto[]> {
    const { data: { Songs } } = await this.ky
      .post("search/gql", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{ Songs(searchTerm: "${term}") { Title Duration Id } }`
        })
      })
      .json();

    return Songs;
    //return this.ky.get(`search/${term}`).json();
  }

  /**
   * Resolves a youtube url to a video and retrives its information
   * @param url youtube url
   */
  async getTrackFromUrl(url: string): Promise<ITrackDto> {
    return this.ky.get(`search/song?songUrl=${encodeURIComponent(url)}`).json();
  }

  /*async getSimilarTrack(term: string): Promise<ITrackDto> {
    return this.ky.get(`search/similarSong?artist=${}`)
  }*/

  /**
   * Retrives related videos for the given id
   * @param id youtube id
   */
  async getRelatedTracks(id: string): Promise<ITrackDto[]> {
    return this.ky.get(`search/radio/${id}`).json();
  }
}

export default new ApiClient();
