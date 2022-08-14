import React from 'react';
import { TextField, makeStyles, Theme, createStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '../Divider';

interface ICustomFormDialogProps {
  id: string;
  title: string;
  label: string;
  button?: JSX.Element;
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
      width: 400,
    },
  })
);

const PlaylistWithMultiSongDialog: React.FunctionComponent<
  ICustomFormDialogProps
> = (props) => {
  const classes = useStyles(props);
  const {
    cancelButtonText,
    confirmButtonText,
    dialogText,
    handleChange,
    handleClose,
    handleConfirm,
    handleSongsChange,
    id,
    label,
    open,
    textField,
    title,
    type,
    button,
  } = props;

  return (
    <>
      {button}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogText}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id={id}
            label={label}
            type={type}
            fullWidth
            onChange={handleChange}
          />
          <Divider />
          <DialogContentText>{textField.dialogText}</DialogContentText>
          <TextField
            id="outlined-textarea"
            label={textField.label}
            placeholder={textField.placeholder}
            multiline
            rows={4}
            rowsMax={4}
            className={classes.textField}
            margin="dense"
            variant="outlined"
            onChange={handleSongsChange}
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

PlaylistWithMultiSongDialog.defaultProps = {
  button: undefined,
};

export default PlaylistWithMultiSongDialog;
