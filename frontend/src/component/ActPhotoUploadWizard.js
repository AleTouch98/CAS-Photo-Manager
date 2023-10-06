import React, { useState } from 'react';
import Stepper from 'react-stepper-horizontal';
import PhotoUploader from './Act1PhotoUploader';
import UploadGeoTags from './Act2UploadGeoTags';
import ChooseCollection from './Act3ChooseCollection';
import Button from '@mui/material/Button';
import { useParams } from 'react-router-dom';
import axios from "axios";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const PhotoUploadWizard = ({onClose, handleAggiornamento}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [nextButtonPhoto, setnextButtonPhoto] = useState(true); 
  const [nextButtonGeo, setnextButtonGeo] = useState(true); 
  const [foto, setFoto] = useState(null);
  const [arrayGeoTags, setArrayGeoTags] = useState(null);
  const [collezione, setCollezione] = useState(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const { userId } = useParams();

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const steps = [
    { title: 'Seleziona Foto' },
    { title: 'Inserisci Geotag' },
    { title: 'Carica Foto' },
  ];

  const handleCaricamentoFoto = (files) => {
    setnextButtonGeo(true);
    if (files.length > 0) {
      setnextButtonPhoto(false);
      setFoto(files); 
    } else {
      setnextButtonPhoto(true);
    }
  };

  const handleCaricamentoGeoTag = (array) => {  
    setArrayGeoTags(array);
    if (array.length === foto.length && !array.includes(undefined)) {
      setnextButtonGeo(false);
    }
  };

  const handleSceltaCollezione = (collezione) => {  
    setCollezione(collezione);
  };

  const axiosConfig = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  const handleCaricaFoto = async () => {
    handleAggiornamento(false);
    if (foto.length === arrayGeoTags.length) {
      for (let i = 0; i < foto.length; i++) {
        const formData = new FormData();
        const currentFoto = foto[i];
        const currentGeoTag = arrayGeoTags[i];
        const address = currentGeoTag.address;
        const lat = currentGeoTag.lat;
        const lng = currentGeoTag.lng;
        formData.append('file', currentFoto);
        formData.append('address', address);
        formData.append('lat', lat);
        formData.append('lng', lng);
        formData.append('collezione', collezione);
        try {
          const result = await axios.post(`http://localhost:8000/dashboard/${userId}/loadImage`, formData, axiosConfig);
          if (result.status !== 200) {
            setSnackbarSeverity('error');
            setSnackbarMessage(result.data);
            setIsSnackbarOpen(true);
            return;
          }
        } catch (error) {
          console.error('Si è verificato un errore:', error);
          setSnackbarSeverity('error');
          setSnackbarMessage('Si è verificato un errore durante il caricamento delle immagini.');
          setIsSnackbarOpen(true);
          return;
        }
      }
      onClose();
      handleAggiornamento(true);
      setSnackbarSeverity('success');
      setSnackbarMessage('Foto caricate con successo');
      setIsSnackbarOpen(true);
      return;
    } else {
      console.error('Le liste foto e arrayGeoTags non hanno la stessa lunghezza.');
    }
  };

  return (
    <div>
      <Stepper steps={steps} activeStep={activeStep} />
      {activeStep === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px' }}>
          <div style={{ marginLeft: '20px', maxHeight: '365px', overflowY: 'auto' }}>
            <PhotoUploader fotoCaricate={foto} onFileUpload={handleCaricamentoFoto} />
          </div>
          <div style={{ marginTop: '16px', marginLeft: "340px", display: 'flex' }}>
            <Button disabled={nextButtonPhoto} onClick={handleNext}>Avanti</Button>
          </div>
        </div>
      )}
      {activeStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px' }}>
          <div style={{ maxHeight: '365px', overflowY: 'auto' }}> 
            <UploadGeoTags onGeoTagChange={handleCaricamentoGeoTag} fotoCaricate={foto} />
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-evenly' }}>
            <Button onClick={handleBack} style={{ marginRight: '90px' }}>Indietro</Button>
            <Button onClick={handleNext} disabled={nextButtonGeo}>Avanti</Button>
          </div>
        </div>
      )}
      {activeStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px' }}>
          <ChooseCollection onChangeSelection={handleSceltaCollezione} />
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-evenly' }}>
            <Button onClick={handleBack} style={{ marginRight: '90px' }}>Indietro</Button>
            <Button onClick={handleCaricaFoto}>Carica Foto</Button>
          </div>
        </div>
      )}
      
      {/* Snackbar per messaggi */}
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

export default PhotoUploadWizard;
