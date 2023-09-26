import React, { useState } from 'react';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import AddGeojsonIcon from '@mui/icons-material/AccountTree'; 
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const AddGeojsonButton = () => {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // Stato per il file selezionato
  const { userId } = useParams();
  const formData = new FormData();

  const handleButtonClick = () => {
    setOpen(true);
  };

  const handleFileSelection = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file); // Aggiorna lo stato con il file selezionato
    formData.append('file', file);
  };

  const axiosConfig = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  const handleGeoJSONUpload = async () => {
    const formDataWithFileName = new FormData();
    formDataWithFileName.append('file', selectedFile);
    formDataWithFileName.append('fileName', fileName);
    await axios.post(
      `http://localhost:8000/dashboard/${userId}/loadGeoJSON`,
      formDataWithFileName,
      axiosConfig
    );
    setOpen(false);
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
          <input
            type="file"
            accept=".geojson"
            onChange={handleFileSelection}
          />
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
