import { InputBase } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import PlayerInterop from "../../dataLayer/api/PlayerInterop";
import Track from "../../dataLayer/models/Track";
import RootStore from "../../dataLayer/stores/RootStore";
import { detectLink } from "../../helpers";
import useInject from "../../hooks/useInject";
import SnackMessage from "../Customs/SnackMessage";
import AyeLogger from "../../modules/AyeLogger";
import { LogType } from "../../types/enums";
import trackRef from "../../dataLayer/references/TrackRef";

const Search = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #565f6c;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const SearchBar: React.FunctionComponent = () => {
  const { t } = useTranslation();
  PlayerInterop.init();

  const Store = ({
    player,
    queue,
    searchResult,
    trackCache
  }: RootStore) => ({
    player,
    queue,
    searchResult,
    trackCache
  });

  const { player, queue, searchResult, trackCache } = useInject(Store);

  const { enqueueSnackbar } = useSnackbar();

  const [term, setTerm] = React.useState("");

  const _handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTerm(event.target.value);
  };

  const _handleSearchIconClick = (event: any) => {
    if (term.length > 0) {
      _search(term);
    }
  };

  const _handleKeyPress = (event: any) => {
    if (event.key === "Enter" && term.length > 0) {
      _search(term);
    }
  };

  const _search = async (term: string) => {
    try {
      if (detectLink(term)) {
        const trackInfo = await searchResult.getTrackFromUrl(term);
        let track: Track;
        if (trackInfo.duration === 0) {
          track = new Track({ ...trackInfo, isLivestream: true });
        } else {
          track = new Track(trackInfo);
        }

        if (!trackCache.tracks.find(t => t.id === track.id)) {
          trackCache.add(track);
        }
        searchResult.clear();
        queue.addPrivilegedTrack(trackRef(track));
        player.playTrack(trackRef(track));
        PlayerInterop.playTrack(trackRef(track));
      } else {
        const results = await searchResult.getTracks(term);
        const foundTracks = [];
        for (const result of results) {
          let track: Track;
          if (result.duration === 0) {
            track = new Track({ ...result, isLivestream: true });
          } else {
            track = new Track(result);
          }
          if (!trackCache.tracks.find(t => t.id === track.id)) {
            trackCache.add(track);
          }
          foundTracks.push(track);
        }
        searchResult.clear();
        searchResult.addTracks(foundTracks);
      }
    } catch (error) {
      AyeLogger.player(
        `Error in SearchBar Component ${JSON.stringify(error, null, 2)}`,
        LogType.ERROR
      );
      enqueueSnackbar("", {
        content: key => (
          <SnackMessage id={key} variant="error" message={t("General.error")} />
        )
      });
    }
  };

  return (
    <Search>
      <InputBase
        onKeyPress={_handleKeyPress}
        onChange={_handleChange}
        placeholder={t("SearchPage.placeholder")}
        inputProps={{ "aria-label": t("SearchPage.title") }}
        style={{ color: "#fbfbfb", marginLeft: "16px", width: "100%" }}
      />
      <SearchIcon
        style={{
          padding: "0px 16px",
          backgroundColor: "#3d4653",
          height: "100%",
          borderRadius: "4px"
        }}
        onClick={_handleSearchIconClick}
      />
    </Search>
  );
};

export default SearchBar;
