import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
//import FormControlLabel from '@mui/material/FormControlLabel';
//import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
//import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Logo from '../svg/photologo.svg';
import Alert from "@mui/material/Alert";
import { Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";



function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="#">
       Progetto Context-Aware Systems
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

  
 
export default function SignUp() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false); // Stato per mostrare/nascondere l'alert
  const [showSuccess, setShowSuccess] = useState(false); // Stato per mostrare/nascondere l'alert
  const [nomeError, setNomeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');


  const handleCloseError = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowAlert(false);
  };

  const handleCloseSuccess = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowSuccess(false);
    navigate('/');  //Reindirizzamento a login
  };

 // Funzione di validazione
 const validate = () => {
  let isValid = true;

  // Validazione nome (puoi personalizzare questa logica)
  if (nome.trim() === '') {
    setNomeError('Il nome è obbligatorio');
    isValid = false;
  } else {
    setNomeError('');
  }

  // Validazione email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setEmailError('Email non valida');
    isValid = false;
  } else {
    setEmailError('');
  }

  // Validazione password (esempio: minimo 6 caratteri)
  if (password.length < 6) {
    setPasswordError('La password deve contenere almeno 6 caratteri');
    isValid = false;
  } else {
    setPasswordError('');
  }

  return isValid;
};

  

const handleSubmit = async (event) => {
  event.preventDefault();

  if (validate()) {
    try {
      const response = await axios.post('http://localhost:8000/register', {
        Nome: nome,
        Email: email,
        Password: password,
      });

      if (response.status === 200) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else if (response.status === 201) {
        setShowAlert(true);
      }
    } catch (error) {
      console.error(
        "Si è verificato un errore durante l'inserimento dell'utente",
        error
      );
      // Gestisci l'errore in base alle tue esigenze
    }
  }
};

useEffect(() => {
  setNomeError(''); // Pulisci l'errore nome quando il nome cambia
}, [nome]);

useEffect(() => {
  setEmailError(''); // Pulisci l'errore email quando l'email cambia
}, [email]);

useEffect(() => {
  setPasswordError(''); // Pulisci l'errore password quando la password cambia
}, [password]);

  


  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backgroundBlendMode: 'lighten',
            border: '2px solid #ccc',
            borderRadius: '10px',
            padding: '20px', // Aggiungi spazio intorno al contenuto
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Aggiungi una leggera ombra
          }}
           >
        <img
            src={Logo}
            alt="Il tuo Logo"
            style={{
            width: '100px', // Imposta la larghezza desiderata del logo
            height: '100px', // Imposta l'altezza desiderata del logo
          }}
            />
          <Typography
            component="h1"
            variant="h4"
            fontWeight="Italic"
            fontFamily="Times New Roman, serif"
            style={{
              textShadow: '2px 2px 4px #E74D2C',
              padding: '10px',
            }}
          >
            REGISTRATI
          </Typography>
          {showAlert ? 
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Snackbar open={true} autoHideDuration={6000} onClose={handleCloseError} anchorOrigin={{
              vertical: 'top',
              horizontal: 'center'}}>
              <Alert
                onClose={handleCloseError}
                severity="error"
                sx={{ width: "350px", height: "51px", display: 'flex', fontSize:"16px", justifyContent:"center"}}
              >
                Account già esistente! Riprovare!
              </Alert>
            </Snackbar>
          </Box>
           : "" }
          {showSuccess ? 
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>

            <Snackbar open={true} 
                    onClose={handleCloseSuccess} 
                    anchorOrigin={{
              vertical: 'top',
              horizontal: 'center'
            }}>
              <Alert
                onClose={handleCloseSuccess}
                severity="success"
                sx={{ width: "350px", height: "51px", display: 'flex', fontSize:"16px", justifyContent:"center"}}
              >
                Account creato con successo!
              </Alert>
            </Snackbar>
            </Box>

           : ""}
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="Nome"
                  onChange={(event) => setNome(event.target.value)}
                  autoFocus
                  error={!!nomeError}
                  helperText={nomeError}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                  error={!!emailError}
                  helperText={emailError}
                  
                />
              </Grid>
              <Grid item xs={12} >
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!passwordError}
                  helperText={passwordError}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: '#E74D2C',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#FF6240',
                },
                '&:active': {
                  backgroundColor: '#FF3C26',
                },
              }}
            >
              Registrati
            </Button>
            <Grid container justifyContent="center">
              <Grid item>
                <Link href="/" variant="body2">
                  Hai già un account? Accedi
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}
