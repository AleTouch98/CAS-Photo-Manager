import React, { useState } from 'react';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import ChoseGeoj from '@mui/icons-material/Map';
import Typography from '@mui/material/Typography';

 

function ChooseGeojson({ onGeoJSONChange }) {

  const { userId } = useParams();
  const [listaNomiGeo, setListaNomiGeo] = useState([]);

 

  const handleButtonClick = async () => {
    try {
      const result = await axios.get(`http://localhost:8000/dashboard/${userId}/getGeoJSONList`);
      const listaGeoJSON = result.data.lista_geojson;
      const nomiGeoJSON = listaGeoJSON.map((elemento) => elemento.nomeGeoJSON);
      setListaNomiGeo(listaGeoJSON);
    } catch (error) {
      console.error("Errore durante la richiesta dei dati:", error);
    }

  };

 

  const handleMenuItemClick = (opzioneScelta) => {
    onGeoJSONChange(opzioneScelta);
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
            <ChoseGeoj style={{ marginRight: '8px' }} /> Scegli GeoJSON
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
            marginLeft: '220px', // Regola questa larghezza per spostare il menu più a sinistra o a destra
          }}
        >
          {listaNomiGeo.map((option, index) => (
            <MenuItem key={index} onClick={() => {
              handleMenuItemClick(option);
              popupState.close(); 
            }}>
              {option.nomeGeoJSON}
            </MenuItem>
          ))}
        </Menu>
      </React.Fragment>
    )}
  </PopupState>
  

  );
}


export default ChooseGeojson;
