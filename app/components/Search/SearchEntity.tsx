import { observer } from "mobx-react-lite";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { TrackModel } from "../../dataLayer/models/Track";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import CustomListDialog from "../Customs/CustomListDialog";
import SnackMessage from "../Customs/SnackMessage";
import SearchEntityMenu from "./SearchEntityMenu";

interface IProps {
  duration: string;
  track: TrackModel;
  index: number;
  onDoubleClick: Function;
}

const Container = styled.div<any>`
  height: 72px;
  width: calc(100% - 16px);
  display: flex;
  position: relative;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #565f6c;
  padding-left: 8px;
  &:last-child {
    border-bottom: none;
  }
  &:hover > div {
    color: #4fc3f7;
  }
`;
const TrackInfoContainer = styled.div<any>`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  padding-left: 8px;
  width: 100%;
`;

// TODO: FIX scrolltext, to only scroll if it really goes out of the designated zone
const Title = styled.div<any>`
  padding-right: 16px;
  width: 300px;
  white-space: nowrap;
  overflow: hidden;
  ${(props: any) => {
    if (props.length >= 42) {
      return `div {

        transform: translateX(0);
        transition-timing-function: linear;
        transition-duration: ${
          props.length === 42 ? "1s" : props.length <= 55 ? "2s" : "3s"
        };
      }
      :hover div {
        transform: translateX(calc(300px - 100%)) translate3d(0,0,0);
      }`;
    }
  }}
`;

const Duration = styled.div`
  font-size: 14px;
  margin-left: 16px;
`;

const TrackImageContainer = styled.div`
  width: 48px;
  height: 48px;
  margin-right: 32px;
  border-radius: 24px;
  overflow: hidden;
`;

const TrackImage = styled.img`
  position: relative;
  width: 64px;
  height: 48px;
  transform: scale(1.4) translate(-5px);
`;

const SearchEntity: React.FunctionComponent<IProps> = props => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const Store = ({ playlists }: RootStoreModel) => ({
    playlists
  });

  const { playlists } = useInject(Store);

  const [open, setOpen] = React.useState(false);

  const _handleClickOpen = () => {
    setOpen(true);
  };

  const _handleClose = (id: string, givenTrack: TrackModel) => {
    setOpen(false);
    const playlist = playlists.getListById(id);
    try {
      if (playlist.tracks.find(track => track.id === givenTrack.id)) {
        enqueueSnackbar("", {
          content: key => (
            <SnackMessage
              id={key}
              variant="warning"
              message={t("SearchEntity.trackExists")}
            />
          )
        });
      } else {
        playlist.addTrack(givenTrack);
        enqueueSnackbar("", {
          content: key => (
            <SnackMessage
              id={key}
              variant="info"
              message={`${t("SearchEntity.trackAdded")} ${playlist.name}`}
            />
          )
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const _createListItem = (value: string) => {
    setOpen(false);
  };

  return (
    <Container>
      <TrackInfoContainer
        onDoubleClick={() => props.onDoubleClick(props.track)}
      >
        <TrackImageContainer>
          <TrackImage
            src={`https://img.youtube.com/vi/${props.track.id}/default.jpg`}
          />
        </TrackImageContainer>
        <Title length={props.track.title.length}>
          <div style={{ display: "inline-block" }}>{props.track.title}</div>
        </Title>
        <Duration>{props.duration}</Duration>
      </TrackInfoContainer>
      <SearchEntityMenu
        id={props.track.id}
        openListDialog={_handleClickOpen}
        isLivestream={props.track.isLivestream}
      />
      <CustomListDialog
        dialogTitle={t("SearchEntity.selectPlaylist")}
        open={open}
        track={props.track}
        onSelect={_handleClose}
        createListItem={_createListItem}
        listItemText={t("SearchEntity.createListText")}
        options={playlists.lists.map(list => {
          return {
            name: list.name,
            id: list.id
          };
        })}
      />
    </Container>
  );
};

export default observer(SearchEntity);
