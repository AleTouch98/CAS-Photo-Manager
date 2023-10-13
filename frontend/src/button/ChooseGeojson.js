import React, { useState } from 'react';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import ChoseGeoj from '@mui/icons-material/Map';
import Typography from '@mui/material/Typography';

function ChooseGeojson({ onGeoJSONChange , valueTestoGeoJSON}) {
  const { userId } = useParams();
  const [listaNomiGeo, setListaNomiGeo] = useState([{ nomeGeoJSON: 'Nessun GeoJSON' }]);


  const handleButtonClick = async () => {
    try {
      const result = await axios.get(`http://localhost:8000/dashboard/${userId}/getGeoJSONList`);
      const listaGeoJSON = result.data.lista_geojson;
      if (result.status === 210) {
        return;
      } else if (listaGeoJSON.length > 0) {
        setListaNomiGeo([{ nomeGeoJSON: 'Nessun GeoJSON' }, ...listaGeoJSON]);
      }
    } catch (error) {
      console.error("Errore durante la richiesta dei dati:", error);
    }
  };


  const handleMenuItemClick = async (opzioneScelta) => {
    onGeoJSONChange(opzioneScelta);
  };


  return (
    <PopupState variant="popover" popupId="demo-popup-menu">
    {(popupState) => (
      <div style={{ height: '30px' }}> 
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
            <ChoseGeoj style={{ marginRight: '8px' }} /> 
            {valueTestoGeoJSON}         </Typography>
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
            marginLeft: '220px', 
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
      </div>
    )}
  </PopupState>
  
  );
}

export default ChooseGeojson;
