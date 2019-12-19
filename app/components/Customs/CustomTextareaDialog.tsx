import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core";

interface ICustomTextareaDialogProps {
  id: string;
  title: string;
  label: string;
  button?: any;
  dialogText: string;
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  confirmButtonText: string;
  cancelButtonText: string;
  type: string;
  placeholder: string;
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

// TODO: Style this accordingly to theme
const CustomTextareaDialog: React.FunctionComponent<ICustomTextareaDialogProps> = props => {
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
            id="outlined-textarea"
            label={props.label}
            placeholder={props.placeholder}
            multiline
            autoFocus
            rows={4}
            rowsMax={4}
            className={classes.textField}
            margin="dense"
            variant="outlined"
            onChange={props.handleChange}
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

export default CustomTextareaDialog;
