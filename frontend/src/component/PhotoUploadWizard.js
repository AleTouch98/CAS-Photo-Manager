import React, { useState } from 'react';
import Stepper from 'react-stepper-horizontal';

const PhotoUploadWizard = () => {
  const [activeStep, setActiveStep] = useState(0);

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

  return (
    <div>
      <Stepper steps={steps} activeStep={activeStep} />
      {activeStep === 0 && (
        <div>
          {/* Contenuto della fase 1 (Selezione Foto) */}
          <button onClick={handleNext}>Avanti</button>
        </div>
      )}
      {activeStep === 1 && (
        <div>
          {/* Contenuto della fase 2 (Inserisci Geotag) */}
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
