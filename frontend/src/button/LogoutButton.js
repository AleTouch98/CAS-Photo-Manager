// LogoutButton.js
import React from 'react';
import LogOutIcon from '@mui/icons-material/ExitToAppOutlined';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';

const LogoutButton = () => {
  return (
    <IconButton color="primary" >
    <Typography variant="inherit" style={{ display: 'flex', alignItems: 'center' ,color: 'white'}}>
    <LogOutIcon style={{ marginLeft: '60px' ,fontSize:'35px'}} /> 
    </Typography>
  </IconButton>
  );
};

export default LogoutButton;
