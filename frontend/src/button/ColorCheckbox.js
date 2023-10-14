import React, {useState} from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

function ColorCheckbox({ valueCheckbox }) {
   
  const [checked, setChecked] = useState(false);

  
  const handleCheckboxChange = (event) => {
    setChecked(!checked);
    valueCheckbox(!checked);
  };

  return (
    <FormControlLabel 
      control={
        <Checkbox
          checked={checked} 
          onChange={handleCheckboxChange} 
          name="Color"
          color="primary"
          style={{ padding: '4.5px' }}
        />
      }
      label="Colore"
      style={{ height: '30px' }}
    />
  );
}

export default ColorCheckbox;
