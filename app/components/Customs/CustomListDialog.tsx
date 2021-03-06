import Avatar from "@material-ui/core/Avatar";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import AddIcon from "@material-ui/icons/Add";
import React from "react";
import Track from "../../dataLayer/models/Track";
import { Ref } from "mobx-keystone";

export interface SimpleDialogProps {
  dialogTitle: string;
  open: boolean;
  options: { id: string; name: string }[];
  track?: Ref<Track>;
  onSelect: (id: string, track?: Track) => void;
  handleClose: () => void;
  createListItem?: (value: string) => void;
  listItemText?: string;
}

const CustomListDialog: React.FunctionComponent<SimpleDialogProps> = props => {
  return (
    <Dialog
      aria-labelledby="custom-dialog-title"
      open={props.open}
      onClose={props.handleClose}
    >
      <DialogTitle id="custom-dialog-title">{props.dialogTitle}</DialogTitle>
      <List>
        {props.options.map(option => (
          <ListItem
            button
            onClick={() => props.onSelect(option.id, props.track?.current)}
            key={option.id}
          >
            <ListItemText primary={option.name} />
          </ListItem>
        ))}
        {props.listItemText && (
          <ListItem
            button
            onClick={() => props.createListItem("createPlaylist")}
          >
            <ListItemAvatar>
              <Avatar>
                <AddIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={props.listItemText} />
          </ListItem>
        )}
      </List>
    </Dialog>
  );
};

export default CustomListDialog;
