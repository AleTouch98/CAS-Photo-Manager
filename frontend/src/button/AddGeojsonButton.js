import React, { useState } from 'react';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import AddGeojsonIcon from '@mui/icons-material/AccountTree'; 
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CustomFileInput from '../component/CustomFileInput';


const AddGeojsonButton = () => {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const { userId } = useParams();

  const handleButtonClick = () => {
    setFileName('');
    setSelectedFile(null);
    setOpen(true);
  };

  const handleGeoJSONUpload = async () => {
    if (!fileName.trim()) {
      alert('Nessun nome file inserito.');
      return;
    } else if (!selectedFile) {
      alert('Nessun file selezionato.');
      return;
    } else {
      const formDataWithFileName = new FormData();
      formDataWithFileName.append('file', selectedFile);
      formDataWithFileName.append('fileName', fileName.trim());
      try {
        const result = await axios.post(
          `http://localhost:8000/dashboard/${userId}/loadGeoJSON`,
          formDataWithFileName,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        if (result.status === 200) {
          setOpen(false);
          alert('Geo caricato con successo');
        } else {
          alert('Errore durante il caricamento del geo');
        }
      } catch (error) {
        console.error('Si è verificato un errore:', error);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <IconButton color="primary" onClick={handleButtonClick}>
        <Typography variant="inherit" style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '15px' }}>
          <AddGeojsonIcon style={{ marginRight: '8px' }} /> Aggiungi Geojson
        </Typography>
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Aggiungi Geojson</DialogTitle>
        <DialogContent>
          <CustomFileInput handleFileSelection={(file) => setSelectedFile(file)} />
          <TextField
            label="Nome del file"
            variant="outlined"
            fullWidth
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            style={{ marginTop: '16px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Annulla
          </Button>
          <Button onClick={handleGeoJSONUpload} color="primary" variant="contained">
            Carica
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddGeojsonButton;
