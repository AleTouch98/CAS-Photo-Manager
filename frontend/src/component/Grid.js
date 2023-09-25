import * as React from 'react';
import { experimentalStyled as styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import ChooseGeoButton from '../button/ChooseGeojson';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor:'#3b3f41',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: '#FFFFFF',
}));

export default function ResponsiveGrid() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        <Grid item xs={1} sm={4} md={4}>
        <Item>
            <ChooseGeoButton />
        </Item>
        </Grid>
        <Grid item xs={1} sm={4} md={4}>
          <Item>Scegli paesi</Item>
        </Grid>
        <Grid item xs={1} sm={4} md={4}>
          <Item>Colora Mappa</Item>
        </Grid>
        
      </Grid>
    </Box>
  );
}

