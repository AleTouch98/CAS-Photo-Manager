import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import ShareComponent from '../component/ShareComponent'; // Importa il componente ShareComponent

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
          <ShareIcon style={{ marginRight: '8px' }} /> Condividi
        </Typography>
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Condividi Collezione...</DialogTitle>
        <DialogContent>
          <ShareComponent /> {/* Mostra il componente ShareComponent nel popup */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddCollection;
