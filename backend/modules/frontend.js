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
      const fileName = req.body.fileName;
      const featureDescrittiva = req.body.featureDescrittiva; // Il nome del file
      const result = await databasepg.inserisciGeoJSON(userId, percorsoFile, fileName, featureDescrittiva); 
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





    //QUERY PER CARICARE DAL DB TUTTE LE FOTO DI UN UTENTE 
    app.get("/dashboard/:userId/photos", async (req, res) => {
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


    //QUERY PER CARICARE DAL DB TUTTE LE FOTO DI UN UTENTE 

    // Funzione per gestire la lettura del file in modo asincrono
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
    
    // Funzione principale per l'endpoint API
    app.post("/dashboard/:userId/photosInGeoJSON", async (req, res) => {
      try {
        const userId = req.params.userId;
        const geojson = req.body.geojson;
        const filePath = geojson.geoJSONPath;
        const featureDescrittiva = geojson.featureDescrittiva;
        const area = req.body.area;
        // Leggi il file GeoJSON in modo asincrono
        const fileData = await readFileAsync(filePath);
        const geojsonData = JSON.parse(fileData); // Parsa il GeoJSON
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
            const queryResult = await databasepg.getFotoUtenteInPolygon(userId, geometry);
            return queryResult.rows;
          }));
          const flatResults = results.flat(); // Serve per schiacciare l'array
          // Elimina le foto con lo stesso ID
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


  app.post("/dashboard/:userId/fotoCollection", async (req, res) => {
    try {
      const userId = req.params.userId;
      const collection = req.body.collection;
      const result = await databasepg.getFotoUtenteInCollection(userId, collection);  
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




  // FUNZIONE UTILIZZATA PER CALCOLARE IL NUMERO OTTIMALE DI CLUSTER  
  async function calculateOptimalClusterNumber(data, maxClusters) {
    const sseArray = [];
    const kValues = Array.from({ length: maxClusters }, (_, i) => i + 1);
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


  
  app.post("/dashboard/:userId/kmeans", async (req, res) => {
    try {
      const userId = req.params.userId;
      const nCluster = req.body.ncluster;
      const photos = await databasepg.getFotoUtente(userId);
      const data = photos.rows.map(photo => [photo.latitudine, photo.longitudine]);
      let k; 
      if(typeof nCluster === 'undefined'){
        k = await calculateOptimalClusterNumber(data, 6);
      } else {
        k = nCluster;
      }
      if(k > data.length){
        res.status(218).json({
          message: "Impossibile eseguide il k-means con un numero di cluster maggiore dei punti dati.",
        });
      }
      var kmeans = new clustering.KMEANS();
      const clusters = kmeans.run(data, k);
      if (clusters) {
        const clusteredData = clusters.map(cluster => cluster.map(index => data[index]));
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



  app.post("/dashboard/:userId/dbscan", async (req, res) => {
    try {
      const userId = req.params.userId;
      const epsilon = req.body.epsilon; // Raggio dell'intorno
      const minPoints = req.body.minpoints; // Numero minimo di punti in un cluster
  
      const photos = await databasepg.getFotoUtente(userId);
      const data = photos.rows.map(photo => [photo.latitudine, photo.longitudine]);
  
      var dbscan = new clustering.DBSCAN();
      const clusters = dbscan.run(data, epsilon, minPoints);
      if (clusters) {
        // Ottieni i punti appartenenti a ciascun cluster
        const clusteredData = clusters.map(cluster => cluster.map(index => data[index]));
        res.status(200).json({
          message: "Risultati DBSCAN",
          clusters: clusteredData,
        });
      } else {
        res.status(200).json({
          message: "Nessun cluster trovato con i parametri dati.",
          clusters: [],
        });
      }
    } catch (error) {
      console.error('Errore generale:', error);
      res.status(500).json({ error: "Errore del Server Interno" });
    }
  });
  


    
  },
};
