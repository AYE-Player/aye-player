import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@material-ui/core';
import Divider from './Divider';
import CustomButton from './Customs/CustomButton';

interface IListenMoeLoginDialogProps {
  open: boolean;
  handleClose: () => void;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleLoginClick: () => Promise<void>;
  handleCancelClick: () => void;
}

const ListenMoeLoginDialog: React.FunctionComponent<
  IListenMoeLoginDialogProps
> = (props) => {
  const {
    open,
    handleCancelClick,
    handleClose,
    handleLoginClick,
    setPassword,
    setUsername,
  } = props;
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Listen Moe Login</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="listenmoe-username"
          label="Username"
          type="text"
          fullWidth
          onChange={(event) => setUsername(event.target.value)}
        />
        <Divider size={2} />
        <TextField
          margin="dense"
          id="listenmoe-password"
          label="Password"
          type="password"
          fullWidth
          onChange={(event) => setPassword(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={handleCancelClick}>
          Cancel
        </Button>
        <CustomButton name="Login" onClick={handleLoginClick} />
      </DialogActions>
    </Dialog>
  );
};

export default ListenMoeLoginDialog;
