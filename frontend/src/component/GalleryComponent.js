import React, {useState} from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import { Typography } from '@mui/material';
import FilterCollectionIcon from '@mui/icons-material/Filter';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function TitlebarImageList() {
  const { userId } = useParams();
  const [images, setImages] = useState([]);

  const handleAllPhoto = async () => {
    console.log('Ho cliccato su tutte le foto');
    try {
      const result = await axios.get(`http://localhost:8000/dashboard/${userId}/photos`);
      if(result.status === 200){
        console.log(result.data);
        const immagini = result.data.immagini;
        //console.log(immagini);
        setImages(immagini);
      } else {
        alert(result.data.message);
      }
    } catch (error) {
      console.error('Errore durante il recupero delle immagini:', error);
    }
  };

  

  return (
    
    <div style={{ width: '100%', overflowX: 'auto' }}>
{/*CREAZIONE DEI BOTTONI*/}
<PopupState variant="popover" popupId="demo-popup-menu">
    {(popupState) => (
      <React.Fragment>
      <IconButton color="primary" variant="contained" {...bindTrigger(popupState)} style={{ position:'relative',marginTop: '10px', marginBottom:'-10px' }} >
        <Typography variant="inherit" style={{ display: 'flex', alignItems: 'center', marginLeft:'20px',marginRight:'50px',  marginTop:'0px', color: 'black', fontSize: '17px' }}>
        <FilterCollectionIcon style={{ marginRight: '8px'  }} />  Collezione  
        </Typography>
      </IconButton>
        <Menu {...bindMenu(popupState)}>
          <MenuItem onClick={popupState.close}>Collezione 1</MenuItem>
          <MenuItem onClick={popupState.close}>Collezione 2</MenuItem>
          <MenuItem onClick={popupState.close}>Collezione 3</MenuItem>
        </Menu>
      </React.Fragment>
    )}
  </PopupState>

  <IconButton color="primary" variant="contained" onClick={handleAllPhoto} style={{ position:'relative',marginTop: '10px', marginBottom:'-10px' }}  >
        <Typography variant="inherit" style={{display: 'flex', alignItems: 'center', marginLeft:'0px',marginRight:'30px', marginTop:'0px', color: 'black', fontSize: '17px' }}>
        <FilterAltIcon style={{ marginRight: '8px'  }} />  Tutte le foto 
        </Typography>
      </IconButton>


  <ImageList sx={{ width: '100%', maxHeight: '81.06vh', paddingTop:'0px',overflowY: 'auto' }}>
  {images.map((image, index) => (
    <ImageListItem key={index}>
      <img
        style={{ width: '100%', height: 'auto' }}
        src={`data:image/jpeg;base64,${image.immaginebase64}`} // Usa 'data:image/jpeg;base64,' per visualizzare immagini in formato base64
        alt={`Image ${index}`}
        loading="lazy"
      />
      <ImageListItemBar
        title={`${image.nome_foto}`} // Puoi personalizzare il titolo come preferisci
        actionIcon={
          <IconButton
            sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
            aria-label={`info about Image ${index}`}
          >
            <InfoIcon />
          </IconButton>
        }
      />
    </ImageListItem>
  ))}
</ImageList>


  </div>
);
}


