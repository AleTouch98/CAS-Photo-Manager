import React, { useState } from 'react';
import Stepper from 'react-stepper-horizontal';
import PhotoUploader from './PhotoUploader';
import UploadGeoTags from './UploadGeoTags';

const PhotoUploadWizard = () => {
  const [activeStep, setActiveStep] = useState(0);

  const [foto, setFoto] = useState(null);

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
    console.log('ho letto le seguenti foto ', files);
    setFoto(files); // Aggiorna l'elenco dei file selezionati nel componente padre
  };

  const handleCaricamentoGeoTag = (files) => {  

  };

  return (
    <div>
      <Stepper steps={steps} activeStep={activeStep} />
      {activeStep === 0 && (
        <div>
          <PhotoUploader onFileUpload={handleCaricamentoFoto} />
          <button onClick={handleNext}>Avanti</button>
        </div>
      )}
      {activeStep === 1 && (
        <div>
          <UploadGeoTags onGeoTagChange={handleCaricamentoGeoTag} fotoCaricate={foto} />
          <button onClick={handleBack}>Indietro</button>
          <button onClick={handleNext}>Avanti</button>
        </div>
      )}
      {activeStep === 2 && (
        <div>
          {/* Contenuto della fase 3 (Carica Foto) */}
          <button onClick={handleBack}>Indietro</button>
          <button onClick={onSubmit}>Carica Foto</button>
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
