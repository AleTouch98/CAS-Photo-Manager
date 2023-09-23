// AddGeojsonButton.js
import React from 'react';
import { IconButton } from '@mui/material';
import AddGeojsonIcon from '@mui/icons-material/AccountTree'; 
import Typography from '@mui/material/Typography';

const AddGeojsonButton = () => {
  return (
    <IconButton color="primary" >
    <Typography variant="inherit" style={{ display: 'flex', alignItems: 'center' ,color: 'white', fontSize:"15px"}}>
    <AddGeojsonIcon style={{ marginRight: '8px' }} /> Aggiungi Geojson 
    </Typography>
  </IconButton>
  );
};

export default AddGeojsonButton;
