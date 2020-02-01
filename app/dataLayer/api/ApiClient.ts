import ky from "ky/umd";
import Track from "../models/Track";
import { ITrackDto, IUserInfoDto, IPlaylistDto } from "../../types/response";

/**
 * Manages all requests to the aye-player backend
 */
class ApiClient {
  private ky: typeof ky;
  /**
   * Prepares our ky instance, also sets a beforeRequst hook
   * to check for an existing token and adding it as a header
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
              request.headers.set("Authorization", `Bearer ${token}`);
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
    const {
      data: { Playlists }
    } = await this.ky
      .post("playlists/gql", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{ Playlists { Name Id Duration SongsCount } }`
        })
      })
      .json();

    return Playlists;
  }

  /**
   * Retrieves a specific playlist of the current user
   * @param id id of the playlist
   */
  async getPlaylist(id: string): Promise<IPlaylistDto> {
    const {
      data: { Playlist }
    } = await this.ky
      .post("playlists/gql", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{ Playlist(PlaylistId: "${id}") { Name Id Duration SongsCount } }`
        })
      })
      .json();

    return Playlist;
  }

  /**
   * Creates a new playlist
   * @param name Name of the new playlist
   */
  async createPlaylist(name: string): Promise<string> {
    const {
      data: { CreateNewPlaylist }
    } = await this.ky
      .post("playlists/gql", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation { CreateNewPlaylist(createNewPlaylistArgs: { Name: "${name}" } ) { Id } }`,
          variables: {}
        })
      })
      .json();

    return CreateNewPlaylist;
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
    console.log("SONGS", songs);
    const {
      data: { CreateNewPlaylistByVideoUrls }
    } = await this.ky
      .post("playlists/gql", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation { CreateNewPlaylistByVideoUrls(createNewPlaylistArgs: { Name: "${name}" Songs: ${songs} } ) { Id } }`,
          variables: {}
        })
      })
      .json();

    console.log("new pl", CreateNewPlaylistByVideoUrls);
    return CreateNewPlaylistByVideoUrls;
  }

  /**
   * Deletes given playlist
   * @param id id of the playlist
   */
  async deletePlaylist(id: string) {
    const {
      data: { DeletePlaylist }
    } = await this.ky
      .post("playlists/gql", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation { DeletePlaylist(deletePlaylistArgs: { PlaylistId: "${id}" }) }`,
          variables: {}
        })
      })
      .json();

    return DeletePlaylist;
  }

  /**
   * Retrieves the given amount of Tracks of a playlist
   * @param id id of the playlist
   * @param amount amount of tracks to retrieve
   */
  async getTracksFromPlaylist(
    id: string,
    amount: number = 20,
    skip: number = 0
  ): Promise<ITrackDto[]> {
    const {
      data: { PlaylistSongs }
    } = await this.ky
      .post("playlists/gql", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{ PlaylistSongs(PlaylistId: "${id}" Skip: ${skip} Take: ${amount}) { Title Duration Id: YouTubeId } }`
        })
      })
      .json();

    return PlaylistSongs;
  }

  /**
   * Adds the given track to the playlist
   * @param id id of the playlist
   * @param track MobX cached Track
   */
  async addTrackToPlaylist(id: string, track: Track) {
    await this.ky
      .post("playlists/gql", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation { AddSongToPlaylist(PlaylistId: "${id}" Id: "${track.id}" Title: "${track.title}" Duration: ${track.duration}) }`,
          variables: {}
        })
      })
      .json();
  }

  /**
   * Adds given tracks to the playlist
   * @param id id of the playlist
   * @param songs array of youtube urls to be added to the playlist
   */
  async addTracksToPlaylistByUrls(id: string, songs: { Url: string }[]) {
    const {
      data: { AddSongsToPlaylistByUrls }
    } = await this.ky
      .post("playlists/gql", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation { AddSongsToPlaylistByUrls(PlaylistId: "${id}" Songs: ${songs}) { Id } }`,
          variables: {}
        })
      })
      .json();

    return AddSongsToPlaylistByUrls;
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
    const {
      data: { Songs }
    } = await this.ky
      .post("search/gql", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{ Songs(searchTerm: "${term}") { Title Duration Id } }`
        })
      })
      .json();

    return Songs;
  }

  /**
   * Resolves a youtube url to a video and retrives its information
   * @param url youtube url
   */
  async getTrackFromUrl(url: string): Promise<ITrackDto> {
    const {
      data: { Song }
    } = await this.ky
      .post("search/gql", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{ Song(songUrl: "${url}") { Title Duration Id } }`
        })
      })
      .json();

    return Song;
  }

  /*async getSimilarTrack(term: string): Promise<ITrackDto> {
    return this.ky.get(`search/similarSong?artist=${}`)
  }*/

  /**
   * Retrives related videos for the given id
   * @param id youtube id
   */
  async getRelatedTracks(id: string): Promise<ITrackDto[]> {
    const {
      data: { Radio }
    } = await this.ky
      .post("search/gql", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{ Radio(startId: "${id}") { Title Duration Id } }`
        })
      })
      .json();

    return Radio;
  }
}

export default new ApiClient();
