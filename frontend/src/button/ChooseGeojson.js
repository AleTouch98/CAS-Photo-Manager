// ChooseGeojson.js
import React from 'react';
import { IconButton } from '@mui/material';
import ChoseGeoj from '@mui/icons-material/Map';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';



const ChooseGeojsonButton = () => {
  return (
    <PopupState variant="popover" popupId="demo-popup-menu">
    {(popupState) => (
      <React.Fragment>
        <IconButton color="primary" variant="contained" {...bindTrigger(popupState)} >
        <Typography variant="inherit" style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '15px' }}>
          <ChoseGeoj style={{ marginRight: '8px' }} /> Scegli GeoJSON
        </Typography>
      </IconButton>
        <Menu {...bindMenu(popupState)}>
          <MenuItem onClick={popupState.close}>Profile</MenuItem>
          <MenuItem onClick={popupState.close}>My account</MenuItem>
          <MenuItem onClick={popupState.close}>Logout</MenuItem>
        </Menu>
      </React.Fragment>
    )}
  </PopupState>
  );
};

export default ChooseGeojsonButton;
