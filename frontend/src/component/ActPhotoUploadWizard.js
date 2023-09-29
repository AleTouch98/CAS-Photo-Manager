import React, { useState } from 'react';
import Stepper from 'react-stepper-horizontal';
import PhotoUploader from './Act1PhotoUploader';
import UploadGeoTags from './Act2UploadGeoTags';
import ChooseCollection from './Act3ChooseCollection';
import Button from '@mui/material/Button';


const PhotoUploadWizard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [nextButtonPhoto, setnextButtonPhoto] = useState(true); // Stato del pulsante "Avanti" in foto
  const [nextButtonGeo, setnextButtonGeo] = useState(true); // Stato del pulsante "Avanti" in geoTag


  const [foto, setFoto] = useState(null);
  const [arrayGeoTags, setArrayGeoTags] = useState(null);

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
    console.log('ARRAY RISULTATO', array);
    setArrayGeoTags(array);
    if(array.length === foto.length && !array.includes(undefined)){
      console.log('geotag selezionato per tutte le foto');
      setnextButtonGeo(false);
    }
  };


  const handleSceltaCollezione= (collezione) => {  
    console.log('Collezione selezionata ', collezione);
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
          <Button onClick={onSubmit}>Carica Foto</Button>
        </div>
      </div>
      
      
      )}
    </div>
  );
};

// Funzione per gestire il caricamento delle foto
const onSubmit = () => {
  // Implementa il caricamento delle foto al server o altre azioni necessarie
  console.log('Caricamento completato');
};

export default PhotoUploadWizard;
