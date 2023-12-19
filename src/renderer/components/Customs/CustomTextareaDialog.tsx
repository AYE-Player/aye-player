import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core';

interface ICustomTextareaDialogProps {
  id: string;
  title: string;
  label: string;
  button: JSX.Element;
  dialogText: string;
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  confirmButtonText: string;
  cancelButtonText: string;
  placeholder: string;
  type: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 400,
    },
  }),
);

// TODO: Style this accordingly to theme
const CustomTextareaDialog: React.FunctionComponent<
  ICustomTextareaDialogProps
> = (props) => {
  const {
    id,
    button,
    open,
    title,
    dialogText,
    handleChange,
    handleClose,
    handleConfirm,
    placeholder,
    cancelButtonText,
    label,
    confirmButtonText,
    type,
  } = props;
  const classes = useStyles(props);

  return (
    <>
      {button}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        id={id}
      >
        <DialogTitle id="form-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogText}</DialogContentText>
          <TextField
            id="outlined-textarea"
            label={label}
            placeholder={placeholder}
            multiline
            autoFocus
            minRows={4}
            maxRows={4}
            className={classes.textField}
            margin="dense"
            variant="outlined"
            onChange={handleChange}
            type={type}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            {cancelButtonText}
          </Button>
          <Button onClick={handleConfirm} color="primary">
            {confirmButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomTextareaDialog;
