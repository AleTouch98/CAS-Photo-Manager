import React, { useState } from 'react';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ColorizeIcon from '@mui/icons-material/Colorize';

 

function ColorMap({optionSelected}) {

  const [listaValori, setListaValori] = useState(['Nessuno', 'HeatMap', 'Colora mappa']);
  

 

  const handleButtonClick = async () => {
    
  };

 

  const handleMenuItemClick = async (opzioneScelta) => {
    optionSelected(opzioneScelta);
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
            <ColorizeIcon style={{ marginRight: '8px' }} /> Heatmap / Color Map
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
            marginLeft: '720px', // Regola questa larghezza per spostare il menu più a sinistra o a destra
          }}
        >
          {listaValori.map((option, index) => (
            <MenuItem key={index} onClick={() => {
              handleMenuItemClick(option);
              popupState.close(); 
            }}>
              {option}
            </MenuItem>
          ))}
        </Menu>
      </React.Fragment>
    )}
  </PopupState>
  

  );
}


export default ColorMap;
