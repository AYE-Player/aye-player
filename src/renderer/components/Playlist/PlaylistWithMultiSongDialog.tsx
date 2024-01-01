import React from 'react';
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import Divider from '../Divider';

interface ICustomFormDialogProps {
  id: string;
  title: string;
  label: string;
  button?: React.JSX.Element;
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

const useStyles = makeStyles(() =>
  createStyles({
    textField: {
      marginLeft: useTheme().spacing(1),
      marginRight: useTheme().spacing(1),
      width: 400,
    },
  }),
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
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ color: 'text.primary' }}>{title}</DialogTitle>
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
            minRows={4}
            maxRows={4}
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
