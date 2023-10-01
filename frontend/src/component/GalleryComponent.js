import React, { useState } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import { Typography } from '@mui/material';
import FilterCollectionIcon from '@mui/icons-material/Filter';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PopupState, { bindTrigger, bindMenu  } from 'material-ui-popup-state';
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

export default function TitlebarImageList() {
  const { userId } = useParams();
  const [images, setImages] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleAllPhoto = async () => {
    try {
      const result = await axios.get(`http://localhost:8000/dashboard/${userId}/photos`);
      if (result.status === 200) {
        const immagini = result.data.immagini;
        setImages(immagini);
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

  const handleDeleteConfirm = () => {
    // Aggiungi qui la logica per l'eliminazione dell'immagine
    // Puoi utilizzare l'ID o qualsiasi altro identificativo unico dell'immagine per eliminarla dal server.
    // Una volta completata l'eliminazione, puoi chiudere il dialogo di conferma.
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setSelectedImage(null);
    setIsDeleteDialogOpen(false);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

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

      <IconButton color="primary" variant="contained" onClick={handleAllPhoto} style={{ position: 'relative', marginTop: '10px', marginBottom: '-10px' }}>
        <Typography variant="inherit" style={{ display: 'flex', alignItems: 'center', marginLeft: '0px', marginRight: '30px', marginTop: '0px', color: 'black', fontSize: '17px' }}>
          <FilterAltIcon style={{ marginRight: '8px' }} />  Tutte le foto
        </Typography>
      </IconButton>

      <ImageList sx={{ width: '100%', maxHeight: '81.06vh', paddingTop: '0px', overflowY: 'auto' }}>
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
                    onClick={handleClick}
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
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
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
