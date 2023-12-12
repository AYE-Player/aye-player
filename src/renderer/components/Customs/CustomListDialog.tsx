import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import React from 'react';
import { Ref } from 'mobx-keystone';
import Track from '../../dataLayer/models/Track';

export interface SimpleDialogProps {
  dialogTitle: string;
  open: boolean;
  options: { id: string; name: string }[];
  track?: Ref<Track>;
  onSelect: any;
  handleClose: () => void;
  createListItem: (value: string) => void;
  listItemText?: string;
}

const CustomListDialog: React.FunctionComponent<SimpleDialogProps> = (
  props
) => {
  const {
    dialogTitle,
    handleClose,
    onSelect,
    open,
    options,
    createListItem,
    listItemText,
    track,
  } = props;
  return (
    <Dialog
      aria-labelledby="custom-dialog-title"
      open={open}
      onClose={handleClose}
    >
      <DialogTitle id="custom-dialog-title">{dialogTitle}</DialogTitle>
      <List>
        {options.map((option) => (
          <ListItem
            button
            onClick={() => onSelect(option.id, track?.current)}
            key={option.id}
          >
            <ListItemText primary={option.name} />
          </ListItem>
        ))}
        {listItemText && (
          <ListItem button onClick={() => createListItem('createPlaylist')}>
            <ListItemAvatar>
              <Avatar>
                <AddIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={listItemText} />
          </ListItem>
        )}
      </List>
    </Dialog>
  );
};

CustomListDialog.defaultProps = {
  track: undefined,
  listItemText: undefined,
};

export default CustomListDialog;