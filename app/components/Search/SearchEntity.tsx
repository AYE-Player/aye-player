import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import { TrackModel } from "../../dataLayer/models/Track";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";
import SearchEntityMenu from "./SearchEntityMenu";

interface IProps {
  duration: string;
  track: TrackModel;
  index: number;
  onClick: Function;
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
  &:hover > svg {
    opacity: 1;
  }
`;
const TrackInfoContainer = styled.div<any>`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  padding-left: 8px;
  width: 100%;
  color: ${(props: any) => (props.active ? "#99ccff" : "")};
`;

const Title = styled.div<any>`
  padding-right: 16px;
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  ${(props: any) => {
    if (props.length >= 30) {
      return `div {

        transform: translateX(0);
        transition-timing-function: cubic-bezier(0.42,0,0.58,1);
        transition-duration: 1s;
      }
      :hover div {
        transform: translateX(calc(200px - 100%));
      }`;
    }
  }}
`;

const Duration = styled.div`
  font-size: 12px;
`;

const TrackImage = styled.img`
  width: 48px;
  height: 48px;
  margin-right: 16px;
  border-radius: 24px;
`;

const SearchEntity: React.FunctionComponent<IProps> = props => {
  const Store = ({ player }: RootStoreModel) => ({
    player
  });

  const { player } = useInject(Store);

  return (
    <Container>
      <TrackInfoContainer
        active={player.currentTrack.id === props.track.id}
        onClick={() => props.onClick(props.track)}
      >
        <TrackImage src={`https://img.youtube.com/vi/${props.track.id}/default.jpg`} />
        <Title length={props.track.title.length}>
          <div style={{ display: "inline-block" }}>{props.track.title}</div>
        </Title>
        <Duration>{props.duration}</Duration>
      </TrackInfoContainer>
      <SearchEntityMenu id={props.track.id} />
    </Container>
  );
};

export default observer(SearchEntity);
