import React, { useState, useEffect } from 'react';
import { Drawer, List, ListItem, Typography, Radio, Select, MenuItem } from '@mui/material';
import AddPhotoButton from '../button/AddPhotoButton';
import AddGeojsonButton from '../button/AddGeojsonButton';
import ShareButton from '../button/ShareButton';
import LogoutButton from '../button/LogoutButton';
import Grid from '@mui/material/Grid';
import Logo from '../svg/photologo.svg';
import MapComponent from '../component/MapComponent'; 
import { useParams } from 'react-router-dom';
import axios from "axios";

const Dashboard = () => {

  const [selectedOption, setSelectedOption] = useState('option1'); 
  const { userId } = useParams();
  const [userName, setUserName] = useState(''); 
  const [statoAggiornamento, setStatoAggiornamento] = useState(false);
  const [userSelected, setUserSelected] = useState(userId);
  const [userFriends, setUserFriends] = useState([]);

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


  useEffect(() => {
    const caricaAmici = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/dashboard/${userId}/getUserFriends`);
        const amici = response.data.utenti;
        const listaAmici = [];
        if(amici){
          amici.forEach((amico) => {
            listaAmici.push(amico);
          });
        } 
        const mioProfilo = { id: userId, nome_utente: 'Mio Profilo' };
        listaAmici.unshift(mioProfilo);
        setUserFriends(listaAmici);
      } catch (error) {
        console.error("Si è verificato un errore nel recupero degli amici:", error);
      }
    };
    caricaAmici();
  }, [userId]);
  
  

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleAggiornamento = (value) => {
    setStatoAggiornamento(value);
  };

  const handleSelectChange = (event) => {
    setUserSelected(event.target.value);
  };

  

  return (
    <div>
      <div style={{
        backgroundColor: "#E74D2C",
        color: "white",
        padding: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        zIndex: '999',
      }}>
        <div>
          <Typography variant="h6" style={{ marginLeft: '10px' }}>Tipo Mappa</Typography>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
        }}>
          Stai visualizzando
          <Select
            value={userSelected}
            onChange={handleSelectChange}
            label="Selezione"
            style={{
              marginLeft: '15px',
              backgroundColor: "#F88463",
              height: '50px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)'
            }}>
            {userFriends && userFriends.length > 0 && userFriends.map((user, index) => (
              <MenuItem key={user.id} value={user.id}>
                {index === 0 ? user.nome_utente : `Profilo di ${user.nome_utente}`}
              </MenuItem>
            ))}
          </Select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: '10px' }}>
            <Typography variant="subtitle1">TIPO DI MAPPA:</Typography>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
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
      </div>
      <Drawer variant="permanent" anchor="left" PaperProps={{ sx: { backgroundColor: "#E74D2C", color: "red", width: '200px' } }}>
        <Grid container direction="column" alignItems="center" justifyContent="center" style={{ backgroundColor: "#F88463", padding: '10px' }}>
          <Grid item>
            <img src={Logo} alt="Logo" style={{ width: '100px', marginBottom: '2px' }} />
          </Grid>
          <Grid item>
            <Typography variant="subtitle1" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
              Benvenuto {userName}
            </Typography>
          </Grid>
        </Grid>
        <List>
          <ListItem button>
            <AddPhotoButton handleAggiornamento={handleAggiornamento} />
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
      <div style={{ marginLeft: '195px', marginTop: '-23px' }}>
        <MapComponent selectedOption={selectedOption} statoAggiornamento={statoAggiornamento} userView={userSelected} /> {/* Ad esempio: <MapComponent /> */}
      </div>
    </div>
  );
  
};

export default Dashboard;
