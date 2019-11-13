import { InputBase } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { observer } from "mobx-react-lite";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import SearchEntity from "../components/Search/SearchEntity";
import Track, { TrackModel } from "../dataLayer/models/Track";
import { RootStoreModel } from "../dataLayer/stores/RootStore";
import useInject from "../hooks/useInject";

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Container = styled.div`
  height: 100%;
`;

const PlaylistContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  height: 100%;
`;

const ScrollContainer = styled.div`
  overflow: auto;
  height: calc(100% - 150px);
`;

const Search = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #565f6c;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const SearchPage: React.FunctionComponent = () => {
  const Store = ({ player, queue, searchResult, tracks }: RootStoreModel) => ({
    player,
    queue,
    searchResult,
    tracks
  });

  const { player, queue, searchResult, tracks } = useInject(Store);

  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation();

  const [term, setTerm] = React.useState("");

  const _handleDoubleClick = (track: TrackModel) => {
    queue.addPrivilegedTrack(track);
    player.playTrack(track);
  };

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

  // TODO: maybe this can be nicer? try to think about something
  const _search = async (term: string) => {
    const results = await searchResult.getTracks(term);
    const foundTracks = [];
    for (const result of results) {
      const track = Track.create(result);
      if (!tracks.tracks.find(t => t.id === track.id)) {
        tracks.add(track);
      }
      foundTracks.push(track);
    }
    searchResult.addTracks(foundTracks);
  };

  return (
    <Container>
      <Header>{t("SearchPage.title")}</Header>
      <PlaylistContainer>
        <Search>
          <InputBase
            onKeyPress={_handleKeyPress}
            onChange={_handleChange}
            placeholder={t("SearchPage.placeholder")}
            inputProps={{ "aria-label": t("SearchPage.title") }}
            style={{ color: "#fbfbfb", marginLeft: "16px", width: "100%" }}
          />
          <SearchIcon
            style={{ padding: "0px 16px", backgroundColor: "#3d4653", height: "100%", borderRadius: "4px" }}
            onClick={_handleSearchIconClick}
          />
        </Search>
        <ScrollContainer>
          {searchResult.isEmpty
            ? []
            : searchResult.tracks.map((track, index) => {
                return (
                  <SearchEntity
                    duration={track.formattedDuration}
                    track={track}
                    key={track.id}
                    index={index}
                    onDoubleClick={_handleDoubleClick}
                    sendNotification={enqueueSnackbar}
                  />
                );
              })}
        </ScrollContainer>
      </PlaylistContainer>
    </Container>
  );
};

export default observer(SearchPage);
