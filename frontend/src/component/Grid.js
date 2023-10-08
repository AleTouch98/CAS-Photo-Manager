import React, {useState, useEffect} from 'react';
import { experimentalStyled as styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import ChooseGeoButton from '../button/ChooseGeojson';
import ChooseArea from '../button/ChooseArea';
import ClusterinButton from '../button/ClusteringButton';
import ColorCheckbox from '../button/ColorCheckbox';
import HeatmapCheckbox from '../button/HeatmapCheckbox';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor:'#3b3f41',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  marginTop: theme.spacing(1),
  textAlign: 'center',
  color: '#FFFFFF',
}));

export default function ResponsiveGrid({geoJSONSelected, valueTestoGeoJSON, areaSelected, clustersFound, valueColorCheckbox, chooseAreaAndColorDisabled, valueHeatmapCheckbox, removeClusters}) {
  
  const [geoJSONSelezionato, setGeoJSONSelezionato] = useState('');

  function handleGeoJSONChange(geoJSONSelezionato) {
    setGeoJSONSelezionato(geoJSONSelezionato);
    geoJSONSelected(geoJSONSelezionato);
  }


  function handleAreaChange(area) {
    areaSelected(area);
  }

  function handleClusteringButton(clusters) {
    clustersFound(clusters);
  }

  function handleValueCheckboxColor(value) {
    valueColorCheckbox(value);
  }

  function handleValueCheckboxHeatmap(value) {
    valueHeatmapCheckbox(value);
  }

  
  return (
    <Box sx={{ flexGrow: 1 }}>
    <Grid container spacing={2} columns={12}>
      <Grid item xs={2} sm={3} md={3}>
        <Item>
          <ChooseGeoButton onGeoJSONChange={handleGeoJSONChange} valueTestoGeoJSON={valueTestoGeoJSON} />
        </Item>
      </Grid>
      <Grid item xs={2} sm={3} md={3}>
        <Item>
          {chooseAreaAndColorDisabled ? null : <ChooseArea selectedGeoJSON={geoJSONSelezionato} onAreaChange={handleAreaChange} />}
        </Item>
      </Grid>
      <Grid item xs={2} sm={2} md={2}>
        <Item>
          {chooseAreaAndColorDisabled ? null : <ColorCheckbox valueCheckbox={handleValueCheckboxColor}/>}
        </Item>
      </Grid>
      <Grid item xs={2} sm={2} md={2}>
        <Item>
          <HeatmapCheckbox valueCheckbox={handleValueCheckboxHeatmap} />
        </Item>
      </Grid>
      <Grid item xs={2} sm={2} md={2}>
        <Item>
          <ClusterinButton resultClustering={handleClusteringButton} removeClusters={removeClusters}/>
        </Item>
      </Grid>
    </Grid>
  </Box>
  

  );
}