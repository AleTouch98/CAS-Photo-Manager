import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import AddCollectionIcon from '@mui/icons-material/CreateNewFolder';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import UploadCollection from '../component/UploadCollection'; // Importa il componente UploadCollection

const AddCollection = () => {
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
          <AddCollectionIcon style={{ marginRight: '8px' }} /> Aggiungi Collezione
        </Typography>
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Carica Collezione</DialogTitle>
        <DialogContent>
          <UploadCollection /> {/* Mostra il componente UploadCollection nel popup */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddCollection;
