import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import { TrackModel } from "../../dataLayer/models/Track";
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
  &:hover {
    color: "#99ccff";
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
  font-size: 14px;
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
  padding-right: 32px;
  width: 64px;
  height: 48px;
  transform: scale(1.4);
`;

const SearchEntity: React.FunctionComponent<IProps> = props => {
  return (
    <Container>
      <TrackInfoContainer onDoubleClick={() => props.onDoubleClick(props.track)}>
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
      <SearchEntityMenu id={props.track.id} />
    </Container>
  );
};

export default observer(SearchEntity);
