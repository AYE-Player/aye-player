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

interface ISearchEntityMenuProps {
  id: string;
  openListDialog: any;
  isLivestream: boolean;
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

const SearchEntityMenu: React.FunctionComponent<ISearchEntityMenuProps> = props => {
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

  const _handlePlayNextTrack = () => {
    queue.addNextTrack(props.id);
    setAnchorEl(null);
  };

  const _handleAddTrack = () => {
    queue.addTrack(props.id);
    setAnchorEl(null);
  };

  const _handleCopyUrl = () => {
    navigator.clipboard.writeText(
      `https://www.youtube.com/watch?v=${props.id}`
    );
  };

  return (
    <ClickAwayListener onClickAway={_handleClose}>
      <Container onClick={_handleClick}>
        <MoreHorizIcon />
        <StyledMenu
          id="playlist-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={_handleClose}
        >
          {props.isLivestream ? (
            <MenuItem onClick={() => _handleCopyUrl()}>
              {t("EntityMenu.copyURL")}
            </MenuItem>
          ) : (
            <span>
              <MenuItem onClick={() => _handlePlayNextTrack()}>
                {t("EntityMenu.playNext")}
              </MenuItem>
              <MenuItem onClick={() => _handleAddTrack()}>
                {t("EntityMenu.addToQueue")}
              </MenuItem>
              <MenuItem onClick={() => props.openListDialog()}>
                {t("EntityMenu.addToPlaylist")}
              </MenuItem>
              <MenuItem onClick={() => _handleCopyUrl()}>
                {t("EntityMenu.copyURL")}
              </MenuItem>
            </span>
          )}
        </StyledMenu>
      </Container>
    </ClickAwayListener>
  );
};

export default SearchEntityMenu;
