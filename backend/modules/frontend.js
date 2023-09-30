const fs = require("fs");
const path = require("path");
const databasepg = require("./queriesDB");
/*const kmeans = require('node-kmeans');
var clustering = require('density-clustering');*/
const { Client } = require("pg");
const { QUERY_CONFIGURATION } = require("./Configuration");
const express = require('express');
const multer = require('multer');

module.exports = {
  createRoutes: (app) => {




    // RICHIESTA PER LA REGISTRAZIONE
    app.post("/register", async (req, res) => {
      try {
        const {Nome, Email, Password } = req.body; // Estrai i dati dalla richiesta POST
        const result = await databasepg.inserisciUtente(Nome, Email, Password); // Passa i parametri Email e Password
        if (result != null) {
          const user = result;
          // Caso in cui l'utente esiste ma la password è errata
          if (result == true) {
            res.status(200).json({ message: "Registrazione avvenuta con successo." });
            return;
          } else {
            res.status(201).json({ message: "Utente già registrato con ${Email}" });
            return;
          }
        } else {
          res.status(500).json({ message: "Errore durante la registrazione." });
          return;
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Errore del Server Interno");
      }
    });




    // RICHIESTA PER ESEGUIRE LOGIN
    app.post("/", async (req, res) => {
      try {
        const { Email, Password } = req.body; // Estrai i dati dalla richiesta POST
        const result = await databasepg.loggaUtente(Email); // Passa i parametri Email e Password
        if (result != null) {
          const user = result;
          // Caso in cui l'utente esiste ma la password è errata
          if (user.password_utente === Password) {
            res.status(200).json({ message: "Login avvenuto con successo.", utente: user.nome_utente, id: user.id });
            return;
          } else {
            res.status(202).json({ message: "Password non corretta!" });
            return;
          }
        } else {
          res.status(203).json({ message: "L'utente non esiste!" });
          return;
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Errore del Server Interno");
      }
    });


    





    //----------------------- FINE GESTIONE QUERY DI LOGIN/REGISTER ----------------------

    //CHIAMATA PER CARICARE I DATI DELL'UTENTE ALL'APERTURA DELLA DASHBOARD 
    app.get("/dashboard/:userId/loaded", async (req, res) => {
      try {
        const userId = req.params.userId;
        const result = await databasepg.getNomeUtenteById(userId);  
        res.status(200).json({ message: "Operazione completata con successo.", nome_utente: result });
      } catch (error) {
        console.error(error);
        res.status(500).send("Errore del Server Interno");
      }
    });

    



    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });


    // RICHIESTA PER CARICARE UN'IMMAGINE 
    app.post("/dashboard/:userId/loadImage", upload.single('file'), async (req, res) => {
      const userId = req.params.userId;
      const file = req.file;
      const fileName = req.file.originalname.split('.')[0];
      const address = req.body.address;
      const lat = req.body.lat;
      const lng = req.body.lng;
      const collezione = req.body.collezione;
      try{
        const imageBuffer = file.buffer;
        const result = await databasepg.inserisciFoto(userId,fileName, imageBuffer, address, lng, lat, collezione);
        if(result === null){
          res.status(200).send('Foto caricata con successo');
        } else {
          res.status(215).send('Errore durante il caricamento della foto: ', result);
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Errore del Server Interno");
      }
    });





    //QUERY PER CARICARE DAL DB TUTTE LE FOTO DI UN UTENTE 
    app.get("/dashboard/:userId/photos", async (req, res) => {
      console.log('sono entrato nella get');
      try {
        const userId = req.params.userId;
        const result = await databasepg.getFotoUtente(userId);  
        if(result.rows.length > 0){
          res.status(200).json({ message: "Download foto completato con successo.", immagini: result.rows });
        } else {
          res.status(210).json({ message: "Nessuna immagine caricata da questo utente." });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Errore del Server Interno");
      }
    });





    const storageJSON = multer.diskStorage({
      destination: function (req, file, cb) {
        const uploadDir = './geojson'; // Cartella di destinazione
        const fullPath = path.resolve(uploadDir); // Risolve il percorso assoluto
    
        // Verifica se la cartella esiste
        if (!fs.existsSync(fullPath)) {
          // Se la cartella non esiste, crea la cartella
          fs.mkdirSync(fullPath, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
      }
    });

    const uploadJSON = multer({storage : storageJSON})

    // FARE IN MODO CHE L'UTENTE POSSA SALVARE ANCHE IL NOME DEL JSON 
     app.post("/dashboard/:userId/loadGeoJSON", uploadJSON.single('file'), async (req, res) => {
      if (!req.file) {
        return res.status(400).send("Nessun file caricato.");
      }
      const userId = req.params.userId;
      const percorsoFile = req.file.path; // Il percorso del file caricato
      const fileName = req.body.fileName; // Il nome del file
      const result = await databasepg.inserisciGeoJSON(userId, percorsoFile, fileName); 
      res.status(200).send("File caricato con successo.");
    });
    
    
   


    //PER CARICARE IL GEOJSON PRENDO IL NOME DAL FILTRO, CERCO NEL DB IL PERCORSO DEL FILE E RITORNO IL FILE 
    app.post('/dashboard/:userId/downloadGeoJSON', (req, res) => {
      const userId = req.params.userId;
      const filePath = req.body.path; // Leggi il percorso del file dal corpo della richiesta
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Errore nella lettura del file:', err);
          return res.status(500).send('Errore nella lettura del file');
        }
        res.status(200).send(data);
      });
    });



    app.get("/dashboard/:userId/getGeoJSONList", async (req, res) => {
      try {
        const userId = req.params.userId;
        const result = await databasepg.getListaGeoJSON();  
        if(result.length > 0){
          res.status(200).json({ message: "Lista GeoJSON caricata con successo.", lista_geojson: result });
        } else {
          res.status(210).json({ message: "Nessun GeoJSON caricato da questo utente." });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Errore del Server Interno");
      }
    });
    

    
  },
};
