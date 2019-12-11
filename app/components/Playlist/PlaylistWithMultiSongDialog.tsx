import React from "react";
import { TextField, makeStyles, Theme, createStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Divider from "../Divider";

interface ICustomFormDialogProps {
  id: string;
  title: string;
  label: string;
  button?: any;
  dialogText: string;
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSongsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  confirmButtonText: string;
  cancelButtonText: string;
  type: string;
  textField: any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 400
    }
  })
);

const PlaylistWithMultiSongDialog: React.FunctionComponent<ICustomFormDialogProps> = props => {
  const classes = useStyles(props);

  return (
    <>
      {props.button}
      <Dialog
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">{props.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{props.dialogText}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id={props.id}
            label={props.label}
            type={props.type}
            fullWidth
            onChange={props.handleChange}
          />
          <Divider />
          <DialogContentText>{props.textField.dialogText}</DialogContentText>
          <TextField
            id="outlined-textarea"
            label={props.textField.label}
            placeholder={props.textField.placeholder}
            multiline
            rows="4"
            rowsMax={4}
            className={classes.textField}
            margin="dense"
            variant="outlined"
            onChange={props.handleSongsChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose} color="secondary">
            {props.cancelButtonText}
          </Button>
          <Button onClick={props.handleConfirm} color="primary">
            {props.confirmButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PlaylistWithMultiSongDialog;
