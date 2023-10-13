const fs = require("fs");
const path = require("path");
const databasepg = require("./queriesDB");
const { Client } = require("pg");
const { QUERY_CONFIGURATION } = require("./Configuration");
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const kmeans = require('node-kmeans');
var clustering = require('density-clustering');



module.exports = {
  createRoutes: (app) => {




    // RICHIESTA PER LA REGISTRAZIONE
    app.post("/register", async (req, res) => {
      try {
        const {Nome, Email, Password } = req.body; 
        const result = await databasepg.inserisciUtente(Nome, Email, Password); 
        if (result != null) {
          const user = result;
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
        const { Email, Password } = req.body; 
        const result = await databasepg.loggaUtente(Email); 
        if (result != null) {
          const user = result;
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

    //RICHIESTA PER CARICARE I DATI DELL'UTENTE ALL'APERTURA DELLA DASHBOARD 
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




    const storageJSON = multer.diskStorage({
      destination: function (req, file, cb) {
        const uploadDir = './geojson'; 
        const fullPath = path.resolve(uploadDir); 
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true }); // Se la cartella non esiste, crea la cartella
        }
        cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
      }
    });




    const uploadJSON = multer({storage : storageJSON})

    // RICHIESTA PER CARICARE IL GEOJSON SUL DB/SERVER
     app.post("/dashboard/:userId/loadGeoJSON", uploadJSON.single('file'), async (req, res) => {
      if (!req.file) {
        return res.status(400).send("Nessun file caricato.");
      }
      const userId = req.params.userId;
      const percorsoFile = req.file.path; 
      const fileName = req.body.fileName;
      const featureDescrittiva = req.body.featureDescrittiva; 
      const result = await databasepg.inserisciGeoJSON(userId, percorsoFile, fileName, featureDescrittiva); 
      res.status(200).send("File caricato con successo.");
    });
    
    
   


    // RICHIESTA PER SCARICARE IL GEOJSON DAL SERVER
    app.post('/dashboard/:userId/downloadGeoJSON', (req, res) => {
      const userId = req.params.userId;
      const filePath = req.body.path; 
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Errore nella lettura del file:', err);
          return res.status(500).send('Errore nella lettura del file');
        }
        res.status(200).send(data);
      });
    });


    //  RICHIESTA PER CARICARE LA LISTA DEI GEOJSON DI UN UTENTE 
    app.get("/dashboard/:userId/getGeoJSONList", async (req, res) => {
      try {
        const userId = req.params.userId;
        const result = await databasepg.getListaGeoJSON(userId);  
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
    


    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });


    // RICHIESTA PER CARICARE UN'IMMAGINE SUL DB
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
        if(result === true){
          res.status(200).send('Foto caricata con successo');
        } else {
          res.status(215).send('Esiste già una foto con lo stesso nome caricata da questo utente. ');
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Errore del Server Interno");
      }
    });





    //QUERY PER SCARICARE DAL DB TUTTE LE FOTO DI UN UTENTE 
    app.get("/dashboard/:userLog/:userView/photos", async (req, res) => {
      try {
        const userView = req.params.userView
        const result = await databasepg.getFotoUtente(userView);  
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


    //RICHIESTA PER CARICARE DAL DB TUTTE LE FOTO DI UN UTENTE 
    function readFileAsync(filePath) {
      return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, fileData) => {
          if (err) {
            console.error('Errore nella lettura del file:', err);
            reject(err);
          } else {
            resolve(fileData);
          }
        });
      });
    }
    app.post("/dashboard/:userLog/:userView/photosInGeoJSON", async (req, res) => {
      try {
        const userView = req.params.userView;
        const geojson = req.body.geojson;
        const filePath = geojson.geoJSONPath;
        const featureDescrittiva = geojson.featureDescrittiva;
        const area = req.body.area;
        const fileData = await readFileAsync(filePath);
        const geojsonData = JSON.parse(fileData); 
        if (geojsonData && geojsonData.features) {
          let geometryFeatures;
          if (area === 'all') {
            geometryFeatures = geojsonData.features.filter(feature => feature.geometry);
          } else {
            const areaFeatures = geojsonData.features.filter(feature => feature.properties[featureDescrittiva] === area);
            geometryFeatures = areaFeatures.filter(feature => feature.geometry);
          }          
          const results = await Promise.all(geometryFeatures.map(async (feature) => {
            const geometry = feature.geometry;
            const queryResult = await databasepg.getFotoUtenteInPolygon(userView, geometry);
            return queryResult.rows;
          }));
          const flatResults = results.flat(); 
          // Elimina le foto con lo stesso id
          const uniquePhotos = flatResults.filter((photo, index, self) => {
            const firstIndex = self.findIndex(p => p.id === photo.id);
            return index === firstIndex;
          });
          res.status(200).json({ message: 'Foto filtrate con successo.', data: uniquePhotos });
        } else {
          res.status(400).json({ error: 'Il file GeoJSON non contiene features valide.' });
        }
      } catch (error) {
        console.error('Errore generale:', error);
        res.status(500).json({ error: "Errore del Server Interno" });
      }
    });
    

  
    // RICHIESTA PER CANCELLARE UNA FOTO DAL DB
  app.post('/dashboard/:userId/deletePhoto', async (req, res) => {
    const userId = req.params.userId;
    const photoId = req.body.id_photo; // Leggi il percorso del file dal corpo della richiesta
    try {
      const result = await databasepg.cancellaFoto(userId,photoId);
      if(result === true){
        res.status(200).send('Immagine cancellata con successo');
      } else{
        res.status(216).send('Si è verificato un errore durante la cancellazione dell\'immagine');
      } 
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Errore del Server Interno" });
    }
  });



  //RICHIESTA PER CARICARE TUTTI I NOMI DELLE COLLEZIONI DI UN UTENTE 
  app.get("/dashboard/:userId/collectionsName", async (req, res) => {
    try {
      const userId = req.params.userId;
      const result = await databasepg.getCollezioniUtente(userId);  
      if(result.rows.length > 0){
        res.status(200).json({ message: "Nomi collezione caricati con successo.", collezioni: result.rows });
      } else {
        res.status(210).json({ message: "Nessuna collezione creata da questo utente." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Errore del Server Interno");
    }
  });


  // RICHIESTA PER SCARICARE LA LISTA DEI NOMI DELLE COLLEZIONI DI UN AMICO
  app.get("/dashboard/:userId/:userView/collectionsName", async (req, res) => {
    try {
      const userView = req.params.userView;
      const result = await databasepg.getCollezioniUtente(userView);  
      if(result.rows.length > 0){
        res.status(200).json({ message: "Nomi collezione caricati con successo.", collezioni: result.rows });
      } else {
        res.status(210).json({ message: "Nessuna collezione creata da questo utente." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Errore del Server Interno");
    }
  });


  // RICHIESTA PER SCARICARE TUTTE LE FOTO DI UNA COLLEZIONE
  app.post("/dashboard/:userId/:userView/fotoCollection", async (req, res) => {
    try {
      const userView = req.params.userView;
      const collection = req.body.collection;
      const result = await databasepg.getFotoUtenteInCollection(userView, collection);  
      if(result.rows.length > 0){
        res.status(200).json({ message: "Foto della collezione caricate con successo.", immagini: result.rows });
      } else {
        res.status(219).json({ message: "Nessuna foto nella collezione richiesta." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Errore del Server Interno");
    }
  });


  // ---------------------------- KMEANS E DBSCAN ----------------------------- //


  // FUNZIONE UTILIZZATA PER CALCOLARE IL NUMERO OTTIMALE DI CLUSTER  (ELBOW METHOD)
  async function calculateOptimalClusterNumber(data) {
    const sseArray = [];
    const kValues = Array.from({ length: data.length }, (_, i) => i + 1);
    for (const k of kValues) {
      await new Promise((resolve, reject) => {
        kmeans.clusterize(data, { k }, (err, result) => {
          if (err) {
            console.error(`Errore durante l'esecuzione di K-Means con k=${k}:`, err);
            reject(err); // Aggiungi questa riga per gestire errori
          } else {
            const sse = result.reduce((accumulator, cluster) => {
              return accumulator + cluster.cluster.reduce((acc, dataPoint) => {
                const squaredDistance = Math.pow(dataPoint[0] - cluster.centroid[0], 2) + Math.pow(dataPoint[1] - cluster.centroid[1], 2);
                return acc + squaredDistance;
              }, 0);
            }, 0);
            sseArray.push(sse);
            resolve(); // Risolvi la promise quando hai i risultati
          }
        });
      });
    }
    const sseDifferences = sseArray.slice(1).map((sse, index) => sseArray[index] - sse);
    let elbowIndex = 0;
    for (let i = 1; i < sseDifferences.length; i++) {
      if (sseDifferences[i] < sseDifferences[i - 1]) {
        elbowIndex = i;
        break;
      }
    }
    const optimalNumClusters = elbowIndex + 1;
    return optimalNumClusters;
  }


  // RICHIESTA PER ESEGUIRE IL KMEANS
  app.post("/dashboard/:userId/:userView/kmeans", async (req, res) => {
    try {
      const userView = req.params.userView;
      const nCluster = req.body.ncluster;
      const photos = await databasepg.getFotoUtente(userView);
      if(photos.rowCount === 0){
        return res.status(218).json({
          message: "Impossibile eseguide il k-means. Nessuna foto caricata da questo utente",
        });
      } 
      if(photos.rowCount === 1){
        return res.status(218).json({
          message: "Impossibile eseguire il k-means su un numero di foto inferiore di 2.",
        });
      }
      const data = photos.rows.map(photo => [photo.latitudine, photo.longitudine]);
      let k; 
      if(typeof nCluster === 'undefined'){
        k = await calculateOptimalClusterNumber(data);
      } else {
        k = nCluster;
      }
      if(k >= data.length || k < 0){
        return res.status(218).json({
          message: "Impossibile eseguire il k-means con un numero di cluster maggiore o uguale dei punti dati / minore di zero.",
        });
      }
      var kmeans = new clustering.KMEANS();
      const clusters = kmeans.run(data, k);
      if (clusters) {
        const clusteredData = clusters.map(cluster => cluster.map(index => data[index]));
        res.status(200).json({
          message: "Risultati KMEANS",
          clusters: clusteredData,
        });
      } else {
        res.status(217).json({
          message: "Nessun cluster trovato con i parametri dati.",
          clusters: [],
        });
      }
    } catch (error) {
      console.error('Errore generale:', error);
      res.status(500).json({ error: "Errore del Server Interno" });
    }
  });


  // RICHIESTA PER ESEGUIRE IL DB SCAN
  app.post("/dashboard/:userId/:userView/dbscan", async (req, res) => {
    try {
      const userView = req.params.userView;
      const epsilon = req.body.epsilon; // Raggio dell'intorno
      const minPoints = req.body.minpoints; // Numero minimo di punti in un cluster
      const photos = await databasepg.getFotoUtente(userView);
      if(photos.rowCount === 0){
        return res.status(218).json({
          message: "Impossibile eseguide il k-means. Nessuna foto caricata da questo utente",
        });
      }
      if(photos.rowCount === 1){
        return res.status(218).json({
          message: "Impossibile eseguide il dbscan su un numero di foto inferiore di 2.",
        });
      }
      const data = photos.rows.map(photo => [photo.latitudine, photo.longitudine]);
      var dbscan = new clustering.DBSCAN();
      if(minPoints > data.length || minPoints < 0){
        return res.status(218).json({
          message: "Impossibile eseguide il dbscan con un numero di minpoints maggiore del numero di punti / minore di zero.",
        });
      }
      const clusters = dbscan.run(data, epsilon, minPoints);
      if (clusters) {
        const clusteredData = clusters.map(cluster => cluster.map(index => data[index])); // punti appartenenti a ciascun cluster
        res.status(200).json({
          message: "Risultati DBSCAN",
          clusters: clusteredData,
        });
      } else {
        res.status(217).json({
          message: "Nessun cluster trovato con i parametri dati.",
          clusters: [],
        });
      }
    } catch (error) {
      console.error('Errore generale:', error);
      res.status(500).json({ error: "Errore del Server Interno" });
    }
  });



  
 // ---------------------------- CONDIVISIONE ----------------------------- //


// RICHIESTA PER OTTENERE TUTTI GLI UTENTI
 app.get("/dashboard/:userId/getAllUsers", async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await databasepg.getNomiUtenti(userId);  
    if(result.rows.length > 0){
      res.status(200).json({ message: "Nomi utenti caricati con successo.", utenti: result.rows });
    } else {
      res.status(210).json({ message: "Nessun nome utente caricato" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Errore del Server Interno");
  }
});

// RICHIESTA PER AGGIUNGERE UNA CONDIVISIONE TRA UTENTI
app.post("/dashboard/:userId/addShare", async (req, res) => {
  try {
    const userId = req.params.userId;
    const condividicon = req.body.condividicon;
    const result = await databasepg.aggiungiCondivisione(userId, condividicon);  
    if(result === true){
      res.status(200).json({ message: "Condivisione inserita con successo."});
    } else {
      res.status(210).json({ message: " Esiste già una condivisione con questo utente"});
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Errore del Server Interno");
  }
});


// RICHIESTA PER OTTENERE TUTTI GLI AMICI DI UN UTENTE 
app.get("/dashboard/:userId/getUserFriends", async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await databasepg.getCondivisioniUtente(userId);
    if (result.rows.length > 0) {
      const utentiAmici = [];
      for (const utente of result.rows) {
        const nome_utente = await databasepg.getNomeUtenteById(utente.utente1);
        utentiAmici.push({
          id: utente.utente1,
          nome_utente: nome_utente,
        });
      }
      res.status(200).json({ message: "Nomi utenti amici caricati con successo.", utenti: utentiAmici });
    } else {
      res.status(210).json({ message: "Nessun utente amico caricato" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Errore del Server Interno");
  }
});


    
  },
};
