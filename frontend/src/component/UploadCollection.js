

import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';

const UploadCollection = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [geoTag, setGeoTag] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleGeoTagChange = (event) => {
    setGeoTag(event.target.value);
  };

  const handleUpload = () => {
    // Simula il caricamento dei dati
    // Qui dovresti implementare la logica per caricare effettivamente la cartella e il geotag
    // Ad esempio, puoi utilizzare una libreria di upload come axios o fetch per inviare i dati al server.

    setUploadStatus('Caricamento in corso...');

    setTimeout(() => {
      setUploadStatus('Caricamento completato');
      onClose(); // Chiudi il popup dopo il caricamento
    }, 2000); // Simuliamo un caricamento di 2 secondi
  };

  return (
    <div>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.gif" // Puoi specificare i formati dei file consentiti
        onChange={handleFileChange}
      />
      <TextField
        label="Geotag"
        variant="outlined"
        fullWidth
        value={geoTag}
        onChange={handleGeoTagChange}
      />
      <Button variant="contained" color="primary" onClick={handleUpload}>
        Carica
      </Button>
      {uploadStatus && (
        <Typography variant="body1" color="textSecondary">
          {uploadStatus}
        </Typography>
      )}
    </div>
  );
};

export default UploadCollection;

