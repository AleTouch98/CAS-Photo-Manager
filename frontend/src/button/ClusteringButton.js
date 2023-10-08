import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import ClusterManagement from '../component/ClusterManagement'; // Importa il componente ClusterManagement

const ClusterButton = ({resultClustering, removeClusters}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  
  const handleResultClustering = (result) => {
    resultClustering(result);
  };


  return (
    <div>
      <IconButton
          color="primary"
          variant="contained"
          style={{ padding: '0px' , height: '30px'}}
          onClick={() => {
            handleOpen();
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
          <AutoGraphIcon style={{ marginRight: '8px' }} /> Cluster mappa
        </Typography>
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Configura il clustering</DialogTitle>
        <DialogContent>
          <ClusterManagement onClose={handleClose} resultClustering={handleResultClustering} removeClusters={removeClusters}/> {/* Passa la funzione di chiusura al componente ClusterManagement */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClusterButton;
