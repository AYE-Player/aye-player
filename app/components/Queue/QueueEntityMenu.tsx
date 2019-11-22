import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Menu, { MenuProps } from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import withStyles from "@material-ui/styles/withStyles";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { RootStoreModel } from "../../dataLayer/stores/RootStore";
import useInject from "../../hooks/useInject";

interface IQueueEntityMenuProps {
  id: string;
  openListDialog: any;
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

const QueueEntityMenu: React.FunctionComponent<IQueueEntityMenuProps> = props => {
  const { t } = useTranslation();

  const Store = ({ queue }: RootStoreModel) => ({
    queue
  });

  const { queue } = useInject(Store);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const _handleClick = (event: any) => {
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
          id="queue-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={_handleClose}
        >
          <MenuItem onClick={() => _handleRemoveTrack(props.id)}>
            {t("EntityMenu.remove")}
          </MenuItem>
          <MenuItem onClick={() => _handlePlayNextTrack(props.id)}>
            {t("EntityMenu.playNext")}
          </MenuItem>
          <MenuItem onClick={() => props.openListDialog()}>
                {t("EntityMenu.addToPlaylist")}
              </MenuItem>
          <MenuItem onClick={() => _handleCopyUrl()}>
            {t("EntityMenu.copyURL")}
          </MenuItem>
        </StyledMenu>
      </Container>
    </ClickAwayListener>
  );
};

export default QueueEntityMenu;
