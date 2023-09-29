import React, { useState } from 'react';
import Stepper from 'react-stepper-horizontal';
import PhotoUploader from './Act1PhotoUploader';
import UploadGeoTags from './Act2UploadGeoTags';
import ChooseCollection from './Act3ChooseCollection';
import Button from '@mui/material/Button';
import { useParams } from 'react-router-dom';
import axios from "axios";


const PhotoUploadWizard = ({onClose}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [nextButtonPhoto, setnextButtonPhoto] = useState(true); // Stato del pulsante "Avanti" in foto
  const [nextButtonGeo, setnextButtonGeo] = useState(true); // Stato del pulsante "Avanti" in geoTag

  const [foto, setFoto] = useState(null);
  const [arrayGeoTags, setArrayGeoTags] = useState(null);
  const [collezione, setCollezione] = useState(null);

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
    if(files.length > 0){
      setnextButtonPhoto(false);
      setFoto(files); 
    } else {
      setnextButtonPhoto(true);
    }
  };

  const handleCaricamentoGeoTag = (array) => {  
    setArrayGeoTags(array);
    if(array.length === foto.length && !array.includes(undefined)){
      setnextButtonGeo(false);
    }
  };


  const handleSceltaCollezione= (collezione) => {  
    setCollezione(collezione);
  };


  const axiosConfig = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  const handleCaricaFoto = async () => {
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
        const result = await axios.post(`http://localhost:8000/dashboard/${userId}/loadImage`, formData, axiosConfig);
        if(result.status !== 200) {
          alert('Si è verificato un errore durante il caricamento: ', result.data);
          return;
        } 
      }
      onClose();
      alert('Foto caricate con successo');
    } else {
      console.error('Le liste foto e arrayGeoTags non hanno la stessa lunghezza.');
    }
  };
  
  



  return (
    <div>
      <Stepper steps={steps} activeStep={activeStep} />
      {activeStep === 0 && (

    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px' }}>
        <PhotoUploader fotoCaricate={foto} onFileUpload={handleCaricamentoFoto} />
      <div style={{ marginTop: '16px', marginLeft:"340px",display: 'flex' }}>
        <Button disabled={nextButtonPhoto} onClick={handleNext}>Avanti</Button>
    </div>
    </div>
      )}
      {activeStep === 1 && (

    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px' }}>
      <UploadGeoTags onGeoTagChange={handleCaricamentoGeoTag} fotoCaricate={foto} />
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-evenly' }}>
          <Button onClick={handleBack} style={{ marginRight: '90px' }}>Indietro</Button>
          <Button onClick={handleNext} disabled={nextButtonGeo}>Avanti</Button>
      </div>
    </div>
      )}
      {activeStep === 2 && (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px' }}>
        <ChooseCollection onChangeSelection={handleSceltaCollezione} collezioniDB={['mare', 'montagna']}/>
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-evenly' }}>
          <Button onClick={handleBack} style={{ marginRight: '90px' }}>Indietro</Button>
          <Button onClick={handleCaricaFoto}>Carica Foto</Button>
        </div>
      </div>
      
      
      )}
    </div>
  );
};


export default PhotoUploadWizard;
