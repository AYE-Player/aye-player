import {
  Avatar,
  Dialog,
  DialogTitle,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
  props,
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
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ color: 'text.primary' }}>{dialogTitle}</DialogTitle>
      <List>
        {options.map((option) => (
          <ListItemButton
            onClick={() => onSelect(option.id, track?.current)}
            key={option.id}
          >
            <ListItemText primary={option.name} />
          </ListItemButton>
        ))}
        {listItemText && (
          <ListItemButton onClick={() => createListItem('createPlaylist')}>
            <ListItemAvatar>
              <Avatar>
                <AddIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={listItemText} />
          </ListItemButton>
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
