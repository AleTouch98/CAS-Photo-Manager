import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import Logo from "../svg/photologo.svg";
import { useNavigate } from "react-router-dom";
import { Snackbar } from "@mui/material";
import Alert from "@mui/material/Alert";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="#">
        Progetto Context-Aware Systems
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showAlertErrorPassword, setShowAlertErrorPassword] = useState(false); 
  const [showAlertErrorLogin, setShowAlertErrorLogin] = useState(false); 
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  
  const handleCloseErrorPassword = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowAlertErrorPassword(false);
  };


  const handleCloseErrorLogin = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowAlertErrorLogin(false);
  };
  
const validate = () => {
  let isValid = true;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setEmailError("Email non valida");
    isValid = false;
  } else {
    setEmailError("");
  }
  if (password.length < 6) {
    setPasswordError("La password deve contenere almeno 6 caratteri");
    isValid = false;
  } else {
    setPasswordError("");
  }
  return isValid;
};


const handleSubmit = async (event) => {
  event.preventDefault();
  if (validate()) {
    try {
      const response = await axios.post("http://localhost:8000/", {
        Email: email,
        Password: password,
      });
      console.log(response);
      if (response.status === 200) {
        console.log("Login effettuato", response.data.utente, response.data.id);
        navigate(`/dashboard/${response.data.id}`);
      } else if (response.status === 202) {
        console.log("Password errata!");
        setShowAlertErrorPassword(true);
      } else if (response.status === 203) {
        console.log("Utente non registrato");
        setShowAlertErrorLogin(true);
      }
    } catch (error) {
      console.error(
        "Si è verificato un errore durante l'inserimento dell'utente",
        error
      );
    }
  }
};


  useEffect(() => {
    setEmailError(""); 
  }, [email]);


  useEffect(() => {
    setPasswordError(""); 
  }, [password]);

 
  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            backgroundBlendMode: "lighten",
            border: "2px solid #ccc",
            borderRadius: "10px",
            padding: "20px", 
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", 
          }}
        >
          <img
            src={Logo}
            alt="Il tuo Logo"
            style={{
              width: "100px",
              height: "100px",
            }}
          />
          <Typography
            component="h1"
            variant="h4"
            fontWeight="Italic"
            fontFamily="Times New Roman, serif"
            style={{
              textShadow: "2px 2px 4px #E74D2C",
              padding: "10px",
            }}
          >
            ACCEDI
          </Typography>
          {showAlertErrorPassword ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Snackbar
                open={true}
                autoHideDuration={6000}
                onClose={handleCloseErrorPassword}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
              >
                <Alert
                  onClose={handleCloseErrorPassword}
                  severity="error"
                  sx={{
                    width: "350px",
                    height: "50px",
                    display: "flex",
                    fontSize: "16px",
                    justifyContent: "center",
                  }}
                >
                  Password errata!
                </Alert>
              </Snackbar>
            </Box>
          ) : (
            ""
          )}
          {showAlertErrorLogin ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Snackbar
                open={true}
                autoHideDuration={6000}
                onClose={handleCloseErrorLogin}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
              >
                <Alert
                  onClose={handleCloseErrorLogin}
                  severity="error"
                  sx={{
                    width: "350px",
                    height: "50px",
                    display: "flex",
                    fontSize: "16px",
                    justifyContent: "center",
                  }}
                >
                  Account non esistente!
                </Alert>
              </Snackbar>
            </Box>
          ) : (
            ""
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
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
              error={!!emailError}
              helperText={emailError}
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
              error={!!passwordError}
              helperText={passwordError}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: "#E74D2C",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#FF6240",
                },
                "&:active": {
                  backgroundColor: "#FF3C26",
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