import React, { useState, useEffect } from "react";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import ShareIcon from '@mui/icons-material/Share';
import { useParams } from "react-router-dom";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const AddGeojsonButton = () => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const { userId } = useParams();
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false); 
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("");
  const [snackbarClass, setSnackbarClass] = useState("");


  const handleButtonClick = () => {
    setSelectedUser('');
    setOpen(true);
  };


  useEffect(() => {
    const caricaDati = async () => {
      try {
        const result = await axios.get(`http://localhost:8000/dashboard/${userId}/getAllUsers`);
        if(result.status === 200){
          setUsers(result.data.utenti);
        }
      } catch (error) {
        console.error("Si è verificato un errore:", error);
      } 
    };
    caricaDati();
  }, []);


  const handleClose = () => {
    setOpen(false);
  };


  const handleFeatureSelect = (event) => {
    setSelectedUser(event.target.value);
  };


  const handleShareClick = async () => {
    try{
      const result = await axios.post(`http://localhost:8000/dashboard/${userId}/addShare`, {condividicon: selectedUser.id});
      if(result.status === 200){
        setSnackbarMessage("Condivisione attivata con successo");
        setSnackbarSeverity("success");
        setSnackbarClass("success-snackbar");
        setIsSnackbarOpen(true);
      } else {
        setSnackbarMessage("Errore durante l'attivazione della condivione. " + result.data.message);
        setSnackbarSeverity("error");
        setSnackbarClass("error-snackbar");
        setIsSnackbarOpen(true);
      }
      setOpen(false);
    } catch (error){
      console.error(error);
    } 
  };

  
  return (
    <div>
      <IconButton color="primary" onClick={handleButtonClick}>
        <Typography
          variant="inherit"
          style={{
            display: "flex",
            alignItems: "center",
            color: "white",
            fontSize: "15px",
          }}
        >
          <ShareIcon style={{ marginRight: '8px' }} /> Condividi
        </Typography>
      </IconButton>
  
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Condividi con ...</DialogTitle>
        <DialogContent>
          <FormControl fullWidth style={{ marginTop: "16px" }}>
            <InputLabel htmlFor="selected-feature">
              Seleziona utente con cui condividere
            </InputLabel>
            <Select
              value={selectedUser}
              onChange={handleFeatureSelect}
              label="Seleziona utente con cui condividere"
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user}>
                  {user.nome_utente}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Annulla
          </Button>
          <Button onClick={handleShareClick} color="primary" variant="contained">
            Condividi
          </Button>
        </DialogActions>
      </Dialog>
  
      {/* Snackbar fuori dalla Dialog */}
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setIsSnackbarOpen(false)}
        sx={{ zIndex: 9999 }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={() => setIsSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
          className={snackbarClass}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );  
};

export default AddGeojsonButton;
