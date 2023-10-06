import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import AddPhotoIcon from '@mui/icons-material/AddAPhoto';
import IconButton from '@mui/material/IconButton';
import PhotoUploadWizard from '../component/ActPhotoUploadWizard';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const AddPhotoButton = ({handleAggiornamento}) => {

  const [open, setOpen] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');


  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEndUpload = () => {
    setOpen(false);
    setSnackbarSeverity('success');
    setSnackbarMessage('Foto caricate con successo');
    setIsSnackbarOpen(true);
  };

  return (
    <div>
      <IconButton color="primary" onClick={handleOpen}>
        <Typography variant="inherit" style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '15px' }}>
          <AddPhotoIcon style={{ marginRight: '8px' }} /> Aggiungi Foto
        </Typography>
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Carica Foto</DialogTitle>
        <DialogContent>
          <PhotoUploadWizard onClose={handleEndUpload} handleAggiornamento={handleAggiornamento}/> {/* Mostra il componente PhotoUploader nel popup */}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setIsSnackbarOpen(false)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <Alert
          onClose={() => setIsSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AddPhotoButton;

