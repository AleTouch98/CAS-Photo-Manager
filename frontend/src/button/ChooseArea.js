import React, { useState } from 'react';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import FlagIcon from '@mui/icons-material/Flag';
import Typography from '@mui/material/Typography';

 

function ChooseArea({selectedGeoJSON, onAreaChange}) {

  const { userId } = useParams();


  const [listaAree, setListaAree] = useState([]);
  

 

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
  };

 

  return (
    <PopupState variant="popover" popupId="demo-popup-menu">
      {(popupState) => (
        <React.Fragment>
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
              <FlagIcon style={{ marginRight: '8px' }} /> Scegli Area
            </Typography>
          </IconButton>
          <Menu
            {...bindMenu(popupState)}
            anchorReference="anchorPosition"
            anchorPosition={{
              top: 32,
              left: 8,
            }}
            getContentAnchorEl={null}
            style={{
              position: 'fixed',
              marginTop: '85px',
              marginLeft: '540px',
            }}
          >
            {listaAree.map((area, index) => (
              <MenuItem key={index} onClick={() => handleMenuItemClick(area)}>
                {area}
              </MenuItem>
            ))}
          </Menu>
        </React.Fragment>
      )}
    </PopupState>
  );
  
}


export default ChooseArea;
