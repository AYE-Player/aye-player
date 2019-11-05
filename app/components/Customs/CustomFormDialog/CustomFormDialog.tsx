import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

interface ICustomFormDialogProps {
  id: string;
  title: string;
  label: string;
  button: any;
  dialogText: string;
  open: boolean;
  handleClose: any;
  handleConfirm: any;
  handleChange: any;
  confirmButtonText: string;
  cancelButtonText: string;
  type: string;
}

const CustomFormDialog: React.FunctionComponent<
  ICustomFormDialogProps
> = props => {
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
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose} color="primary">
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

export default CustomFormDialog;
