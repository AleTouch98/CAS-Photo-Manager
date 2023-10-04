import React, { useState } from 'react';
import PopupState from 'material-ui-popup-state';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

function ColorMap({ optionSelected }) {

  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleMenuItemClick = (option) => {
    let updatedOptions;
    if (selectedOptions.includes(option)) {
      updatedOptions = selectedOptions.filter((item) => item !== option);
    } else {
      updatedOptions = [...selectedOptions, option];
    }
    setSelectedOptions(updatedOptions);
    optionSelected(updatedOptions); 
  };

  return (
    <PopupState variant="popover" popupId="demo-popup-menu">
  {(popupState) => (
    <div style={{ height: '30px', display: 'flex', alignItems: 'center' }}>
      <FormControl component="fieldset">
        <FormGroup>
          <div style={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
  control={
    <Checkbox
      checked={selectedOptions.includes('Color')}
      onChange={() => handleMenuItemClick('Color')}
      name="Color"
      color="primary"
    />
  }
  label="Color"
  style={{
    marginRight: '5px',
    fontSize: '12px', // Imposta il valore desiderato per la dimensione del testo
    textAlign: 'center'
  }}
/>
<FormControlLabel
  control={
    <Checkbox
      checked={selectedOptions.includes('Heatmap')}
      onChange={() => handleMenuItemClick('Heatmap')}
      name="Heatmap"
      color="primary"
    />
  }
  label="Heatmap"
  style={{
    fontSize: '12px', // Imposta il valore desiderato per la dimensione del testo
    textAlign: 'center'
  }}
/>

          </div>
        </FormGroup>
      </FormControl>
    </div>
  )}
</PopupState>





  

  );
}

export default ColorMap;

