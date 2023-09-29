import React, { useState, useEffect } from 'react';
import { Drawer, List, ListItem } from '@mui/material';
import AddPhotoButton from '../button/AddPhotoButton';
import AddGeojsonButton from '../button/AddGeojsonButton';
import ShareButton from '../button/ShareButton';
import LogoutButton from '../button/LogoutButton';
import Grid from '@mui/material/Grid';
import Logo from '../svg/photologo.svg';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import MapComponent from '../component/MapComponent'; 
import { useParams } from 'react-router-dom';
import axios from "axios";

const Dashboard = () => {

  const [selectedOption, setSelectedOption] = useState('option1'); // Stato per tenere traccia dell'opzione selezionata
  const { userId } = useParams();
  const [userName, setUserName] = useState(''); 

  useEffect(() => {
    const caricaDati = async () => {
      try {
        const result = await axios.get(`http://localhost:8000/dashboard/${userId}/loaded`);
        setUserName(result.data.nome_utente);
      } catch (error) {
        console.error("Si è verificato un errore:", error);
      }
    };
    caricaDati();
  }, [userId]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div>
      {/* Top Bar */}
      <div style={{ backgroundColor: "#E74D2C", color: "white", padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', top: '0', left: '0', right: '0', zIndex: '999' }}>
        <Typography variant="h6" style={{ marginLeft: '10px' }}>Tipo Mappa</Typography>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" style={{ marginRight: '10px' }}>TIPO DI MAPPA:</Typography>
          <Radio
            checked={selectedOption === 'option1'}
            onChange={handleOptionChange}
            value="option1"
            color="default"
          /> OpenStreetMap
          <Radio
            checked={selectedOption === 'option2'}
            onChange={handleOptionChange}
            value="option2"
            color="default"
          /> Stamen

        </div>
      </div>

      {/* Sidebar */}
      <Drawer variant="permanent" anchor="left" PaperProps={{ sx: { backgroundColor: "#E74D2C", color: "red",  width: '200px' } }}>
        <Grid container direction="column" alignItems="center" justifyContent="center" style={{ backgroundColor: "#F88463", padding: '10px' }}>
          {/* Inserisci il tuo logo sopra il bottone */}
          <Grid item>
            <img src={Logo} alt="Logo" style={{ width: '100px', marginBottom: '2px' }} />
          </Grid>
          {/* Inserisci il testo "Benvenuto" */}
          <Grid item>
            <Typography variant="subtitle1" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>Benvenuto {userName}</Typography>
          </Grid>
        </Grid>
        <List>
          <ListItem button>
            <AddPhotoButton />
          </ListItem>
          <ListItem button>
            <AddGeojsonButton />
          </ListItem>
          <ListItem button>
            <ShareButton />
          </ListItem>
        </List>
        <div style={{ flexGrow: 1 }}></div>
        <List>
          <ListItem button>
            <LogoutButton />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <div style={{ marginLeft: '195px', marginTop:'-23px'}}>
        {/* style={{ marginLeft: '195px', marginTop:'182px', marginRight:'-5px' }} */}
        <MapComponent selectedOption={selectedOption} /> {/* Ad esempio: <MapComponent /> */}
      </div>
      
    </div>
  );
};

export default Dashboard;
