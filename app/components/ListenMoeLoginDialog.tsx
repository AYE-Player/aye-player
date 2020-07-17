import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@material-ui/core";
import Divider from "./Divider";
import CustomButton from "./Customs/CustomButton";

interface IListenMoeLoginDialogProps {
  open: boolean;
  handleClose: () => void;
  username: string;
  password: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  handleLoginClick: Function;
  handleCancelClick: Function;
}

const ListenMoeLoginDialog: React.FunctionComponent<IListenMoeLoginDialogProps> = (
  props
) => {
  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
    >
      <DialogTitle>Listen Moe Login</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="listenmoe-username"
          label="Username"
          type="text"
          fullWidth
          onChange={(event) => props.setUsername(event.target.value)}
        />
        <Divider size={2} />
        <TextField
          margin="dense"
          id="listenmoe-password"
          label="Password"
          type="password"
          fullWidth
          onChange={(event) => props.setPassword(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={() => props.handleCancelClick()}>Cancel</Button>
        <CustomButton name="Login" onClick={() => props.handleLoginClick()} />
      </DialogActions>
    </Dialog>
  );
};

export default ListenMoeLoginDialog;
