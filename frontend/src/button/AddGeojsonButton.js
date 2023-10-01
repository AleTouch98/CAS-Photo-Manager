import React, { useState, useEffect } from 'react';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import AddGeojsonIcon from '@mui/icons-material/AccountTree'; 
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CustomFileInput from '../component/CustomFileInput';

const AddGeojsonButton = () => {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [geojsonFeatures, setGeojsonFeatures] = useState([]);
  const { userId } = useParams();



  const handleButtonClick = () => {
    setFileName('');
    setSelectedFile(null);
    setSelectedFeature('');
    setGeojsonFeatures([]);
    setOpen(true);
  };




  useEffect(() => {
    // Carica le features dal GeoJSON quando il file viene selezionato
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const geojsonData = JSON.parse(e.target.result);
          if (geojsonData && geojsonData.features) {
            const primaFeature = geojsonData.features[0];
            const properties = primaFeature.properties;
            const propertyNamesList = [];
            for (const propertyName in properties) {
              const propertyValue = properties[propertyName];
              console.log(`Nome della proprietà: ${propertyName}, Valore: ${propertyValue}`);
              propertyNamesList.push(propertyName);
            }
            console.log(propertyNamesList);
            setGeojsonFeatures(propertyNamesList);
          }
        } catch (error) {
          console.error('Errore nel parsing del GeoJSON:', error);
        }
      };
      reader.readAsText(selectedFile);
    }
  }, [selectedFile]);




  const handleGeoJSONUpload = async () => {
    if (!fileName.trim()) {
      alert('Nessun nome file inserito.');
      return;
    } else if (!selectedFile) {
      alert('Nessun file selezionato.');
      return;
    } else if (!selectedFeature) {
      alert('Seleziona una feature.');
      return;
    } else {
      const formDataWithFileName = new FormData();
      formDataWithFileName.append('file', selectedFile);
      formDataWithFileName.append('fileName', fileName.trim());
      formDataWithFileName.append('featureDescrittiva', selectedFeature);
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

  const handleFeatureSelect = (event) => {
    console.log(event.target.value);
    setSelectedFeature(event.target.value);
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
          <FormControl fullWidth style={{ marginTop: '16px' }}>
            <InputLabel>Seleziona la feature descrittiva</InputLabel>
            <Select
              value={selectedFeature}
              onChange={handleFeatureSelect}
            >
              {geojsonFeatures.map((feature, index) => (
                <MenuItem key={index} value={feature}>
                  {feature}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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

