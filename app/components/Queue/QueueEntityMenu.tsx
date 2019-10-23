import React from "react";
import styled from "styled-components";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import Menu, { MenuProps } from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

import useInject from "../../hooks/useInject";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import withStyles from "@material-ui/styles/withStyles";

interface IQueueEntityMenuProps {
  id: string;
}

const Container = styled.div`
  height: 24px;
  width: 24px;
  display: block;
  right: 0;
  cursor: pointer;
`;

const StyledMenu = withStyles({
  paper: {
    backgroundColor: "#3D4653",
    boxShadow:
      "0 6px 10px 0 rgba(0, 0, 0, 0.2), 0 8px 22px 0 rgba(0, 0, 0, 0.19)",
    color: "#FBFBFB"
  }
})((props: MenuProps) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "top",
      horizontal: "left"
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right"
    }}
    {...props}
  />
));

const QueueEntityMenu: React.FunctionComponent<
  IQueueEntityMenuProps
> = props => {
  const Store = ({ queue }: RootStoreModel) => ({
    queue: queue
  });

  const { queue } = useInject(Store);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const _handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const _handleClose = () => {
    setAnchorEl(null);
  };

  const _handleRemoveTrack = (id: string) => {
    queue.removeTrack(id);
    setAnchorEl(null);
  };

  const _handlePlayNextTrack = (id: string) => {
    queue.addNextTrack(id);
    setAnchorEl(null);
  };

  const _handleCopyUrl = () => {
    navigator.clipboard.writeText(
      `https://www.youtube.com/watch?v=${queue.currentTrack.id}`
    );
  };

  return (
    <ClickAwayListener onClickAway={_handleClose}>
      <Container onClick={_handleClick}>
        <MoreHorizIcon />
        <StyledMenu
          id="playlist-menu-item"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={_handleClose}
        >
          <MenuItem onClick={() => _handleRemoveTrack(props.id)}>
            Remove
          </MenuItem>
          <MenuItem onClick={() => _handlePlayNextTrack(props.id)}>
            Play next
          </MenuItem>
          <MenuItem onClick={() => _handleCopyUrl()}>Copy Url</MenuItem>
        </StyledMenu>
      </Container>
    </ClickAwayListener>
  );
};

export default QueueEntityMenu;
