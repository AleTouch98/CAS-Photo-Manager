import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import AddPhotoIcon from '@mui/icons-material/AddAPhoto';
import IconButton from '@mui/material/IconButton';
import PhotoUploader from '../component/PhotoUploader'; // Importa il componente PhotoUploader
import UploadGeoTag from '../component/UploadGeoTags'; 
import PhotoUploadWizard from '../component/PhotoUploadWizard';

const AddPhotoButton = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
          <PhotoUploadWizard /> {/* Mostra il componente PhotoUploader nel popup */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddPhotoButton;

