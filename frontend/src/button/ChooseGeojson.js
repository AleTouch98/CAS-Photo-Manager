import React, { useState } from 'react';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useParams } from 'react-router-dom';
import axios from 'axios';

 

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
          <Button
            variant="contained"
            color="primary"
            {...bindTrigger(popupState)}
            onClick={() => {
              handleButtonClick();
              popupState.open();
            }}
          >
            Scegli GeoJSON
          </Button>
          <Menu {...bindMenu(popupState)}>
            {listaNomiGeo.map((option, index) => (
              <MenuItem key={index} onClick={() => handleMenuItemClick(option)}>
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
