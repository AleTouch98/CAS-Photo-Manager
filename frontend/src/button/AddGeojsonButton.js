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
    setFileName('');
    for (const key of formData.keys()) {
      formData.delete(key);
    }
    setOpen(true);
  };

  const handleFileSelection = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const geojsonContent = event.target.result;
      console.log('sto leggendo il contenuto del json');
      const geojson = JSON.parse(geojsonContent); 
      let hasMultiPolygon = false; 
      if (geojson.features) {
        for (const feature of geojson.features) {
          if (feature.geometry && feature.geometry.type === "MultiPolygon") {
            hasMultiPolygon = true;
            break; 
          }
        }
      }
      if (hasMultiPolygon) {
        console.log('ho settato il file');
        setSelectedFile(file);
      } else {
        e.target.value = null;
        alert('il geojson caricato non ha una struttura corretta di tipo multipolygon');
      }
    };
    reader.readAsText(file);
  };
  

  const axiosConfig = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  const handleGeoJSONUpload = async () => {
    if (!fileName.trim()) {
      alert('Nessun nome file inserito.');
      return;
    } else if(!selectedFile) {
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
          axiosConfig
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
