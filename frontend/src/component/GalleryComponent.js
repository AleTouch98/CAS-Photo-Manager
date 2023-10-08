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
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


export default function TitlebarImageList({imageRemove, statoAggiornamento, userView}) {
  const { userId } = useParams();
  const [images, setImages] = useState([]);
  const [anchorEls, setAnchorEls] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [collezioni, setCollezioni] = useState([]);
  const [collezioneSelezionata, setCollezioneSelezionata] = useState('');
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('');
  const [snackbarClass, setSnackbarClass] = useState('');
  const [isRemoveButtonDisabled, setIsRemoveButtonDisabled] = useState(false);


  useEffect(() => {
    const caricaDati = async () => {
      try {
        const photoResult = await axios.get(`http://localhost:8000/dashboard/${userId}/${userView}/photos`);
        setImages(photoResult.data.immagini);
      } catch (error) {
        console.error("Si è verificato un errore:", error);
      } 
    };
    caricaDati();
    setIsRemoveButtonDisabled(userView !== userId);
  }, [userView]);


  
  useEffect(() => {
    const aggiornaDati = async () => {
      if(statoAggiornamento){
        if(collezioneSelezionata !== ''){
          await handleCollectionSelected({nome_collezione: collezioneSelezionata});
        } else {
          await handleAllPhoto();
        }
      }
    };
    aggiornaDati();
  }, [statoAggiornamento]);


  const handleAllPhoto = async () => {
    try {
      const result = await axios.get(`http://localhost:8000/dashboard/${userId}/${userView}/photos`);
      if (result.status === 200) {
        setCollezioneSelezionata('');
        const immagini = result.data.immagini;
        setImages(immagini);
        setAnchorEls(Array(immagini.length).fill(null)); // Inizializza l'array di anchorEl
      } else {
        alert(`${result.data.message}`);
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
    try {
      const result = await axios.post(`http://localhost:8000/dashboard/${userId}/deletePhoto`, { id_photo: selectedImage.id });

      if (result.status === 200) {
        setSnackbarMessage('Foto eliminata con successo');
        setSnackbarSeverity('success');
        setSnackbarClass('success-snackbar');
        imageRemove(selectedImage.id);
        const nuoveImmagini = images.filter(image => image.id !== selectedImage.id);
        setImages(nuoveImmagini);
      } else {
        setSnackbarMessage(`Si è verificato un errore durante la cancellazione: ${result.data}`);
        setSnackbarSeverity('error');
        setSnackbarClass('error-snackbar');
      }

      setIsSnackbarOpen(true);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Si è verificato un errore:', error);
    }
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
      const result = await axios.get(`http://localhost:8000/dashboard/${userId}/${userView}/collectionsName`);
      if(result.status === 200){
          setCollezioni(result.data.collezioni);
      }
    } catch (error) {
        console.error('Errore nella richiesta HTTP:', error);
    }
  };


  const handleCollectionSelected = async (option) => {
    try {
      const result = await axios.post(`http://localhost:8000/dashboard/${userId}/${userView}/fotoCollection`,{collection: option.nome_collezione});
      if(result.status === 200){
        setCollezioneSelezionata(option.nome_collezione);
        setImages(result.data.immagini);
      } else {
        alert(`${result.data.message}`);
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
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <FilterCollectionIcon style={{ marginRight: '8px' }} />
    <Typography
      variant="inherit"
      style={{
        color: 'black',
        fontSize: '16px',
      }}
    >
      {collezioneSelezionata ? collezioneSelezionata : 'Scegli collezione'}
    </Typography>
  </div>
</IconButton>
            <Menu  {...bindMenu(popupState)}
          anchorReference="anchorPosition"
          anchorPosition={{
            top: 32, // Regola questa altezza per spostare il menu più in alto o in basso
            left: 8, // Regola questa larghezza per spostare il menu più a sinistra o a destra
          }}
          getContentAnchorEl={null}
          style={{
            position: 'fixed',
            marginTop: '85px', // Regola questa altezza per spostare il menu più in alto o in basso
            marginLeft: '1150px', // Regola questa larghezza per spostare il menu più a sinistra o a destra
          }}
        >
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
      position: 'absolute',
      top: '10px',
      right: '40px', // Posizione fissa a destra
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <FilterAltIcon style={{ marginRight: '8px' }} />
      <Typography
        variant="inherit"
        style={{
          color: 'black',
          fontSize: '16px',
        }}
      >
        Tutte le foto
      </Typography>
    </div>
  </IconButton>


      <ImageList
        sx={{
          width: '100%',
          maxHeight: '81.06vh',
          paddingTop: '0px',
          overflowY: 'auto',
        }}
      >
        {images && images.map((image, index) => (
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
                    disabled={isRemoveButtonDisabled}
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

    <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setIsSnackbarOpen(false)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        className={snackbarClass}
      >
        <Alert
          onClose={() => setIsSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    
    </div>
  );
}
