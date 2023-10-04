import React, {useState} from 'react';
import { experimentalStyled as styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import ChooseGeoButton from '../button/ChooseGeojson';
import ChooseArea from '../button/ChooseArea';
import HeatColorMap from '../button/HeatColorMap';
import ClusterinButton from '../button/ClusteringButton';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor:'#3b3f41',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  marginTop: theme.spacing(1),
  textAlign: 'center',
  color: '#FFFFFF',
}));

export default function ResponsiveGrid({geoJSONSelected, areaSelected, optionSelected, clustersFound}) {
  
  const [geoJSONSelezionato, setGeoJSONSelezionato] = useState('');
  const [chooseAreaDisabled, setChooseAreaDisabled] = useState(true);

  function handleGeoJSONChange(geoJSONSelezionato) {
    console.log(geoJSONSelezionato);
    if(geoJSONSelezionato.nomeGeoJSON === 'Nessun GeoJSON'){
      console.log('setto a true');
      setChooseAreaDisabled(true);
    } else {
      setChooseAreaDisabled(false);
    }
    setGeoJSONSelezionato(geoJSONSelezionato);
    geoJSONSelected(geoJSONSelezionato);
  }


  function handleAreaChange(area) {
    areaSelected(area);
  }

  function handleOptionChange(option) {
    console.log(option);
    optionSelected(option);
  }

  function handleClusteringButton(clusters) {
    clustersFound(clusters);
  }

  
  return (
    <Box sx={{ flexGrow: 1 }}>
  <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
    <Grid item xs={1} sm={3} md={3}>
      <Item>
        <ChooseGeoButton onGeoJSONChange={handleGeoJSONChange} />
      </Item>
    </Grid>
    <Grid item xs={1} sm={3} md={3}>
      <Item>
        {chooseAreaDisabled ? null : <ChooseArea selectedGeoJSON={geoJSONSelezionato} onAreaChange={handleAreaChange} />}
      </Item>
    </Grid>
    <Grid item xs={1} sm={3} md={3}>
      <Item>
        <HeatColorMap optionSelected={handleOptionChange} />
      </Item>
    </Grid>
    <Grid item xs={1} sm={3} md={3}>
      <Item>
        <ClusterinButton resultClustering={handleClusteringButton} />
      </Item>
    </Grid>
  </Grid>
</Box>

  );
}
