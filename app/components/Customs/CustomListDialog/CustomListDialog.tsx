import React from "react";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import AddIcon from "@material-ui/icons/Add";
import { TrackModel } from "../../../dataLayer/models/Track";

export interface SimpleDialogProps {
  dialogTitle: string;
  open: boolean;
  options: any[];
  track: TrackModel;
  onSelect: (id: string, track: TrackModel) => void;
  createListItem: (value: string) => void;
}

const CustomListDialog = (props: SimpleDialogProps) => {
  const { onSelect, open, createListItem } = props;

  const handleListItemClick = (value: string, track: TrackModel) => {
    onSelect(value, track);
  };

  const handleListAddListItemClick = (value: string) => {
    createListItem(value);
  }

  return (
    <Dialog
      aria-labelledby="custom-dialog-title"
      open={open}
    >
      <DialogTitle id="custom-dialog-title">{props.dialogTitle}</DialogTitle>
      <List>
        {props.options.map(option => (
          <ListItem
            button
            onClick={() => handleListItemClick(option.id, props.track)}
            key={option.id}
          >
            <ListItemText primary={option.name} />
          </ListItem>
        ))}
        <ListItem button onClick={() => handleListAddListItemClick("createPlaylist")}>
          <ListItemAvatar>
            <Avatar>
              <AddIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="create playlist" />
        </ListItem>
      </List>
    </Dialog>
  );
}

export default CustomListDialog;
