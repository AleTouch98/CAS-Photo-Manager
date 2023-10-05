import React, { useState, useEffect } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import { Typography } from '@mui/material';
import FilterCollectionIcon from '@mui/icons-material/Filter';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Popover from '@mui/material/Popover';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function TitlebarImageList({imageRemove}) {
  const { userId } = useParams();
  const [images, setImages] = useState([]);
  const [anchorEls, setAnchorEls] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [collezioni, setCollezioni] = useState([]);


  useEffect(() => {
    const caricaDati = async () => {
      try {
        const photoResult = await axios.get(`http://localhost:8000/dashboard/${userId}/photos`);
        setImages(photoResult.data.immagini);
      } catch (error) {
        console.error("Si è verificato un errore:", error);
      } finally {
      }
    };
    caricaDati();
  }, []);


  const handleAllPhoto = async () => {
    try {
      const result = await axios.get(`http://localhost:8000/dashboard/${userId}/photos`);
      if (result.status === 200) {
        const immagini = result.data.immagini;
        setImages(immagini);
        setAnchorEls(Array(immagini.length).fill(null)); // Inizializza l'array di anchorEl
      } else {
        alert(result.data.message);
      }
    } catch (error) {
      console.error('Errore durante il recupero delle immagini:', error);
    }
  };

  const handleDeleteClick = (image) => {
    setSelectedImage(image);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    const result = await axios.post(`http://localhost:8000/dashboard/${userId}/deletePhoto`, {id_photo:selectedImage.id});
    if(result.status === 200){
      alert('Foto eliminata con successo');
      imageRemove(selectedImage.id);
      const nuoveImmagini = images.filter(image => image.id !== selectedImage.id);
      setImages(nuoveImmagini);
    } else {
      alert('Si è verificato un errore durante la cancellazione: \n', result.data);
    } 
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setSelectedImage(null);
    setIsDeleteDialogOpen(false);
  };

  const handleClick = (event, index) => {
    const newAnchorEls = [...anchorEls];
    newAnchorEls[index] = event.currentTarget;
    setAnchorEls(newAnchorEls);
  };

  const handleClose = (index) => {
    const newAnchorEls = [...anchorEls];
    newAnchorEls[index] = null;
    setAnchorEls(newAnchorEls);
  };

  const handleClickMenuCollection = async () => {
    try {
      const result = await axios.get(`http://localhost:8000/dashboard/${userId}/collectionsName`);
      if(result.status === 200){
          setCollezioni(result.data.collezioni);
      }
    } catch (error) {
        console.error('Errore nella richiesta HTTP:', error);
    }
  };


  const handleCollectionSelected = async (option) => {
    try {
      const result = await axios.post(`http://localhost:8000/dashboard/${userId}/fotoCollection`,{collection: option.nome_collezione});
      if(result.status === 200){
        setImages(result.data.immagini);
      } else {
        alert(result.data.message);
      } 
    } catch (error) {
        console.error('Errore nella richiesta HTTP:', error);
    }
  };


  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      {/* CREAZIONE DEI BOTTONI */}
      <PopupState variant="popover" popupId="demo-popup-menu">
        {(popupState) => (
          <React.Fragment>
            <IconButton
              color="primary"
              variant="contained"
              {...bindTrigger(popupState)}
              style={{
                position: 'relative',
                marginTop: '10px',
                marginBottom: '-10px',
              }}
              onClick={() => {
                handleClickMenuCollection();
                popupState.open();
              }}
            >
              <Typography
                variant="inherit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '20px',
                  marginRight: '50px',
                  marginTop: '0px',
                  color: 'black',
                  fontSize: '17px',
                }}
              >
                <FilterCollectionIcon style={{ marginRight: '8px' }} /> Collezione
              </Typography>
            </IconButton>
            <Menu {...bindMenu(popupState)}>
            {collezioni.map((option, index) => (
              <MenuItem key={index} onClick={() => {
                handleCollectionSelected(option);
                popupState.close();
              }}>
                {option.nome_collezione}
              </MenuItem>
            ))}
            </Menu>
          </React.Fragment>
        )}
      </PopupState>

      <IconButton
        color="primary"
        variant="contained"
        onClick={handleAllPhoto}
        style={{
          position: 'relative',
          marginTop: '10px',
          marginBottom: '-10px',
        }}
      >
        <Typography
          variant="inherit"
          style={{
            display: 'flex',
            alignItems: 'center',
            marginLeft: '0px',
            marginRight: '30px',
            marginTop: '0px',
            color: 'black',
            fontSize: '17px',
          }}
        >
          <FilterAltIcon style={{ marginRight: '8px' }} /> Tutte le foto
        </Typography>
      </IconButton>

      <ImageList
        sx={{
          width: '100%',
          maxHeight: '81.06vh',
          paddingTop: '0px',
          overflowY: 'auto',
        }}
      >
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
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                    aria-label={`info about Image ${index}`}
                    onClick={(event) => handleClick(event, index)}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton
                    sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                    aria-label={`delete Image ${index}`}
                    onClick={() => handleDeleteClick(image)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              }
            />
            <Popover
              open={Boolean(anchorEls[index])}
              anchorEl={anchorEls[index]}
              onClose={() => handleClose(index)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <Box p={1}>
                <Typography variant="h6">Informazioni:</Typography>
                <Typography variant="body1">Nome Foto: {image.nome_foto}</Typography>
                <Typography variant="body1">Autore: {image.nome_utente}</Typography>
                <Typography variant="body1">Posizione: {image.indirizzo}</Typography>
              </Box>
            </Popover>
          </ImageListItem>
        ))}
      </ImageList>
      {/* Popup di conferma per l'eliminazione */}
      {selectedImage && (
        <Dialog open={isDeleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Conferma Eliminazione</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Sei sicuro di voler eliminare l'immagine "{selectedImage.nome_foto}"?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Annulla
            </Button>
            <Button onClick={handleDeleteConfirm} color="primary">
              Conferma
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
