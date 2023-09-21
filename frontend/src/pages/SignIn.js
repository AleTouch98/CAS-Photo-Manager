import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import Logo from '../svg/photologo.svg';


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

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function SignIn() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const logUser = () => {
    axios
      .post('http://localhost:8000/login', {
        Email: email,
        Password: password,
      })
      .then((response) => {
        console.log('Utente loggato', response.data);
        // Eseguire altre azioni se necessario dopo la registrazione
      })
      .catch((error) => {
        console.error('Errore durante il login', error);
        // Gestire l'errore in modo appropriato (ad esempio, mostrando un messaggio all'utente)
      });
  };

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
            ACCEDI
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              onClick={logUser}
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
              Accedi
            </Button>
            <Grid container>
              <Grid item>
                <Link href="/register" variant="body2">
                  {"Ancora non sei registrato? Registrati!"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}