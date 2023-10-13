import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ClusterManagement({ onClose, resultClustering, removeClusters , userView}) {
  const [autoConfig, setAutoConfig] = useState(true);
  const [manualClusterCount, setManualClusterCount] = useState(1);
  const [algorithmType, setAlgorithmType] = useState('K-Means');
  const [epsilon, setEpsilon] = useState(1); 
  const [minPoints, setMinPoints] = useState(1); 
  const { userId } = useParams();


  const handleConfigChange = (event) => {
    const { name, value } = event.target;
    if (name === 'configType') {
      setAutoConfig(value === 'auto');
      setManualClusterCount(1);
    } else if (name === 'manualClusterCount') {
      setManualClusterCount(parseInt(value));
    } else if (name === 'algorithmType') {
      setAlgorithmType(value);
    }
  };


  const handleAlgorithmTabChange = (event, newValue) => {
    setAlgorithmType(newValue);
  };


  const handleClusterButtonClick = async () => {
    if(algorithmType === 'K-Means'){
        if(autoConfig){
            const result = await axios.post(`http://localhost:8000/dashboard/${userId}/${userView}/kmeans`);
            resultClustering(result);
        } else {
            const result = await axios.post(`http://localhost:8000/dashboard/${userId}/${userView}/kmeans`, {ncluster: manualClusterCount});
            resultClustering(result); 
        }
    } else {
        const result = await axios.post(`http://localhost:8000/dashboard/${userId}/${userView}/dbscan`, {epsilon: epsilon, minpoints: minPoints});
        resultClustering(result);
    }
    onClose();
  };


  const handleRimuoviClusters = () => {
    removeClusters();
    onClose();
  };


  const renderAlgorithmSpecificOptions = () => {
    if (algorithmType === 'K-Means') {
      return (
        <div>
          <FormControl fullWidth style={{ marginTop: '16px' }}>
            <InputLabel shrink={true} htmlFor="config-type">
              Tipo di Configurazione
            </InputLabel>
            <Select
              id="config-type"
              name="configType"
              value={autoConfig ? 'auto' : 'manual'}
              onChange={handleConfigChange}
              label="Tipo di Configurazione"
            >
              <MenuItem value="auto">Automatica (Elbow Method)</MenuItem>
              <MenuItem value="manual">Manuale</MenuItem>
            </Select>
          </FormControl>
          {!autoConfig && (
            <FormControl fullWidth style={{ marginTop: '16px' }}>
              <InputLabel shrink={true} htmlFor="cluster-count">
                Numero di Cluster
              </InputLabel>
              <TextField
                type="number"
                id="cluster-count"
                name="manualClusterCount"
                value={manualClusterCount}
                onChange={handleConfigChange}
                label="Numero di Cluster"
                variant="outlined"
                fullWidth
                inputProps={{
                  min: 1,
                }}
              />
            </FormControl>
          )}
        </div>
      );
    } else if (algorithmType === 'DBScan') {
      return (
        <div>
          <FormControl fullWidth style={{ marginTop: '16px' }}>
            <InputLabel shrink={true} htmlFor="epsilon">
              Epsilon
            </InputLabel>
            <TextField
              type="number"
              id="epsilon"
              name="epsilon"
              value={epsilon}
              onChange={(event) => setEpsilon(parseInt(event.target.value))}
              label="Epsilon"
              variant="outlined"
              fullWidth
              inputProps={{
                  min: 0,
                }}
            />
          </FormControl>
          <FormControl fullWidth style={{ marginTop: '16px' }}>
            <InputLabel shrink={true} htmlFor="min-points">
              Min Points
            </InputLabel>
            <TextField
              type="number"
              id="min-points"
              name="minPoints"
              value={minPoints}
              onChange={(event) => setMinPoints(parseInt(event.target.value))}
              label="Min Points"
              variant="outlined"
              fullWidth
              inputProps={{
                  min: 1,
                }}
            />
          </FormControl>
        </div>
      );
    }
  };

  

  return (
    <Box p={2}>
      <Tabs
        value={algorithmType}
        onChange={handleAlgorithmTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label="K-Means" value="K-Means" />
        <Tab label="DBScan" value="DBScan" />
      </Tabs>
  
      {renderAlgorithmSpecificOptions()}
  
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleClusterButtonClick}
      >
        Esegui {algorithmType}
      </Button>
      <Button
        variant="contained"
        color="error"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleRimuoviClusters} 
      >
        Rimuovi clusters
      </Button>
    </Box>
  );  
}

export default ClusterManagement;
