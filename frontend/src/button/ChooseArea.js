import React, { useState } from 'react';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import FlagIcon from '@mui/icons-material/Flag';
import Typography from '@mui/material/Typography';

 

function ChooseArea({selectedGeoJSON, onAreaChange, iconButtonDisabled}) {

  const { userId } = useParams();


  const [listaAree, setListaAree] = useState([]);

  const [selectedOption, setSelectedOption] = useState(null); 
  

 

  const handleButtonClick = async () => {  
    if (!selectedGeoJSON) {
      console.error('Nessun file selezionato.');
      return;
    }
    try {
      const path = selectedGeoJSON.geoJSONPath;
      const response = await axios.post(`http://localhost:8000/dashboard/${userId}/downloadGeoJSON`, { path });
      if (response.status === 200) {
        const geojsonData = response.data;
        if (geojsonData && geojsonData.features) {
          const featureList = geojsonData.features.map((feature) => feature.properties[selectedGeoJSON.featureDescrittiva]);
          featureList.unshift('Nessuna area');
          setListaAree(featureList);
        }
      } else {
        console.error('Errore durante il recupero del GeoJSON:', response.statusText);
      }
    } catch (error) {
      console.error('Errore durante il recupero del GeoJSON:', error);
    }
  };
  
 

  const handleMenuItemClick = async (opzioneScelta) => {
    onAreaChange(opzioneScelta);
    setSelectedOption(opzioneScelta);
  };

  if (iconButtonDisabled) {
    return null;
  }

  return (
    <PopupState variant="popover" popupId="demo-popup-menu">
  {(popupState) => (
    <div style={{ height: '30px' }}> {/* Imposta l'altezza fissa desiderata */}
      <IconButton
        color="primary"
        variant="contained"
        style={{ padding: '0px' }}
        {...bindTrigger(popupState)}
        onClick={() => {
          handleButtonClick();
          popupState.open();
        }}
      >
        <Typography
          variant="inherit"
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            fontSize: '15px',
          }}
        >
          <FlagIcon style={{ marginRight: '8px' }} /> 
          {selectedOption ? selectedOption : 'Scegli Area'}
        </Typography>
      </IconButton>
      <Menu
        {...bindMenu(popupState)}
        anchorReference="anchorPosition"
        anchorPosition={{
          top: 32, // Regola questa altezza per spostare il menu più in alto o in basso
          left: 8, // Regola questa larghezza per spostare il menu più a sinistra o a destra
        }}
        getContentAnchorEl={null}
        style={{
          position: 'fixed',
          marginTop: '85px', // Regola questa altezza per spostare il menu più in alto o in basso
          marginLeft: '540px', // Regola questa larghezza per spostare il menu più a sinistra o a destra
        }}
      >
        {listaAree.map((area, index) => (
          <MenuItem key={index} onClick={() => {
            handleMenuItemClick(area);
            popupState.close(); 
          }}> 
            {area}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )}
</PopupState>

  );
  
}


export default ChooseArea;
