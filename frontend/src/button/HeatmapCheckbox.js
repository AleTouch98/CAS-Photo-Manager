import React, {useState} from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

function HeatmapCheckbox({ valueCheckbox }) {
   
  const [checked, setChecked] = useState(false);

  // Funzione per gestire il cambio di stato del checkbox
  const handleCheckboxChange = (event) => {
    setChecked(!checked);
    valueCheckbox(!checked);// Passa il nuovo valore al genitore tramite la prop onChange
  };

  return (
    <FormControlLabel 
      control={
        <Checkbox
          checked={checked} // Utilizza il valore da valueCheckbox per determinare se il checkbox deve essere selezionato o deselezionato
          onChange={handleCheckboxChange} // Usa la funzione di gestione
          name="Color"
          color="primary"
          style={{ padding: '4.5px' }}
        />
      }
      label="Heatmap"
      style={{ height: '30px' }}
    />
  );
}

export default HeatmapCheckbox;
