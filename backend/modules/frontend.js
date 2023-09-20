const fs = require('fs');
const path = require('path');
const databasepg = require('./queriesDB');
/*const kmeans = require('node-kmeans');
var clustering = require('density-clustering');*/

module.exports = {
    createRoutes: (app) => {
        //This function get the data from the local file system
        app.get('/getUtenti', async (req, res) => {
            try {
              const result = await databasepg.getAllUtenti();
        
              if (result instanceof Error) {
                await res.status(400).send("Errore nella query");
                return;
              } else {
                // Estrai solo la proprietà 'rows' dal risultato
                const rows = result.rows;
        
                // Crea un oggetto di risposta con solo 'rows'
                const response = {
                  utenti: rows,
                };
        
                // Invia la risposta come JSON
                res.header("Access-Control-Allow-Origin", "*");
                res.status(200).json(response);
              }
            } catch (error) {
              console.error(error);
              res.status(500).send('Errore del Server Interno');
            }
        });


        app.post('/register', async (req, res) => {
          try {
            // Estrai i dati dalla richiesta POST
            const { Nome, Email, Password } = req.body;

            const result = await databasepg.inserisciUtente(Nome, Email, Password);
  
            // Simuliamo una risposta di successo
            const response = {
              message: 'Utente registrato con successo',
              nome: Nome,
              email: Email,
            };
        
            res.header('Access-Control-Allow-Origin', '*');
            res.status(200).json(response);
          } catch (error) {
            console.error(error);
            res.status(500).send('Errore del Server Interno');
          }
        });


        app.post('/login', async (req, res) => {
          try {
            // Estrai i dati dalla richiesta POST
            const { Email, Password } = req.body;
            const result = await databasepg.loggaUtente(Email, Password);
  
            // Simuliamo una risposta di successo
            const response = {
              message: 'Utente loggato con successo',
              email: Email,
            };
        
            res.header('Access-Control-Allow-Origin', '*');
            res.status(200).json(response);
          } catch (error) {
            console.error(error);
            res.status(500).send('Errore del Server Interno');
          }
        });
        

    }
}