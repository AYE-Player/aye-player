import React from "react";
import styled from "styled-components";
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Menu, { MenuProps } from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import useInject from "../../hooks/useInject";
import { RootStoreModel } from "../../store/RootStore";
import withStyles from "@material-ui/styles/withStyles";
// import { TrackModel } from "app/store/Track";

interface IPlaylistEntityMenuProps {
  id: string
}

const Container = styled.div`
  height: 24px;
  width: 24px;
  position: absolute;
  display: block;
  right: 0;
  cursor: pointer;
  margin-right: 12px;
`;

const StyledMenu = withStyles({
  paper: {
    backgroundColor: '#3D4653',
    boxShadow: '0 6px 10px 0 rgba(0, 0, 0, 0.2), 0 8px 22px 0 rgba(0, 0, 0, 0.19)',
    color: "#FBFBFB"
  },
})((props: MenuProps) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
));

const PlaylistEntityMenu: React.FunctionComponent<IPlaylistEntityMenuProps> = props => {
  const Store = ({ playlist, queue }: RootStoreModel) => ({
    playlist: playlist,
    queue: queue
  });

  const { playlist, queue } = useInject(Store);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const _handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const _handleClose = () => {
    setAnchorEl(null);
  };

  const _handleRemoveTrack = (id: string) => {
    playlist.removeTrackById(id);
    setAnchorEl(null);
  };

  const _handlePlayNextTrack = (id: string) => {
    queue.addNextTrack(id);
    setAnchorEl(null);
  }

  return (
    <Container onClick={_handleClick}>
      <MoreHorizIcon />
      <StyledMenu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={_handleClose}
      >
        <MenuItem onClick={() => _handleRemoveTrack(props.id)}>Remove</MenuItem>
        <MenuItem onClick={() => _handlePlayNextTrack(props.id)}>Play next</MenuItem>
      </StyledMenu>
    </Container>
  );
};

export default PlaylistEntityMenu;
