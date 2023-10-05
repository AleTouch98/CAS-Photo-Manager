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

function ClusterManagement({ onClose, resultClustering }) {
  const [autoConfig, setAutoConfig] = useState(true);
  const [manualClusterCount, setManualClusterCount] = useState(1);
  const [algorithmType, setAlgorithmType] = useState('K-Means');
  const [epsilon, setEpsilon] = useState(1); // Aggiunta variabile epsilon
  const [minPoints, setMinPoints] = useState(1); // Aggiunta variabile minPoints
  const { userId } = useParams();

  const handleConfigChange = (event) => {
    const { name, value } = event.target;
    if (name === 'configType') {
      setAutoConfig(value === 'auto');
      // Quando il tipo di configurazione cambia, azzera il valore del numero di cluster
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
            const result = await axios.post(`http://localhost:8000/dashboard/${userId}/kmeans`);
            if(result.status !== 200){
              alert(result.data.message);
            } else {
              resultClustering(result.data.clusters);
            }  
        } else {
            const result = await axios.post(`http://localhost:8000/dashboard/${userId}/kmeans`, {ncluster: manualClusterCount});
            if(result.status !== 200){
              alert(result.data.message);
            } else {
              resultClustering(result.data.clusters);
            }  
        }
    } else {
        const result = await axios.post(`http://localhost:8000/dashboard/${userId}/dbscan`, {epsilon: epsilon, minpoints: minPoints});
        resultClustering(result.data.clusters);
    }
    onClose();
  };

  const handleRimuoviClusters = () => {
    resultClustering([]);
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
    color="error" // Impostiamo il colore su "secondary" per ottenere un pulsante rosso
    fullWidth
    sx={{ mt: 2 }}
    onClick={handleRimuoviClusters} // Aggiungiamo un gestore di eventi per il clic del pulsante
  >
    Rimuovi clusters
  </Button>
</Box>

  );
}

export default ClusterManagement;
