import React, { useState } from 'react';
import { Checkbox, FormControlLabel, TextField, Select, MenuItem, FormControl, InputLabel, Button, Box } from '@mui/material';

const ChooseCollection = () => {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [newCollection, setNewCollection] = useState('');

  const handleCheckboxChange = () => {
    setCheckboxChecked(!checkboxChecked);
    if (!checkboxChecked) {
      setNewCollection(''); 
    }
  };

  const handleNewCollectionChange = (event) => {
    setNewCollection(event.target.value);
  };

  const handleCollectionChange = (event) => {
    setSelectedCollection(event.target.value);
  };

  return (
    <div>
      <Box paddingTop="30px " display="flex" flexDirection="column">
        <FormControl>
          <InputLabel htmlFor="collection-select">Seleziona Collezione</InputLabel>
          <Select
            value={selectedCollection}
            onChange={handleCollectionChange}
            label="Seleziona Collezione"
            inputProps={{
              id: 'collection-select',
            }}
          >
            <MenuItem value="collezione1">Collezione 1</MenuItem>
            <MenuItem value="collezione2">Collezione 2</MenuItem>
            <MenuItem value="collezione3">Collezione 3</MenuItem>
            
          </Select>
        </FormControl>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={checkboxChecked}
              onChange={handleCheckboxChange}
            />
          }
          label="Aggiungi Nuova Collezione"
        />

        {checkboxChecked && (
          <TextField
            label="Nuova Collezione"
            value={newCollection}
            onChange={handleNewCollectionChange}
          />
        )}
      </Box>

      
    </div>
  );
};

export default ChooseCollection;
