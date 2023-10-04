import React, { useState } from 'react';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
 

function HeatMapButton() {

  

 

  const handleButtonClick = async () => {
    
  };

 

  const handleMenuItemClick = async (opzioneScelta) => {
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
            <ScatterPlotIcon style={{ marginRight: '8px' }} /> DBScan
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
            marginLeft: '860px', // Regola questa larghezza per spostare il menu più a sinistra o a destra
          }}
        >
        
        </Menu>
      </React.Fragment>
    )}
  </PopupState>
  

  );
}


export default HeatMapButton;