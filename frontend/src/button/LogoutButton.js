import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import LogOutIcon from '@mui/icons-material/ExitToAppOutlined';
import Typography from '@mui/material/Typography';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const LogoutButton = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    // Implementa qui la logica effettiva per il logout
    // Puoi chiamare una funzione che effettua il logout
    // o effettuare una chiamata API per invalidare la sessione dell'utente.

    // Utilizza "replace" invece di "navigate" per reindirizzare senza possibilità di tornare indietro
    navigate('/', { replace: true });

    // Chiudi il dialogo di conferma
    handleClose();
  };

  return (
    <>
      <IconButton color="primary" onClick={handleOpen}>
        <Typography variant="inherit" style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
          <LogOutIcon style={{ marginLeft: '60px', fontSize: '35px' }} />
        </Typography>
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Conferma Logout</DialogTitle>
        <DialogContent>
          Sei sicuro di voler effettuare il logout?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Annulla
          </Button>
          <Button onClick={handleLogout} color="primary">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogoutButton;
