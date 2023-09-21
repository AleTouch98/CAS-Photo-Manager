const fs = require("fs");
const path = require("path");
const databasepg = require("./queriesDB");
/*const kmeans = require('node-kmeans');
var clustering = require('density-clustering');*/
const { Client } = require("pg");
const { QUERY_CONFIGURATION } = require("./Configuration");

module.exports = {
  createRoutes: (app) => {
    //This function get the data from the local file system
    app.get("/getUtenti", async (req, res) => {
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
        res.status(500).send("Errore del Server Interno");
      }
    });

    app.post("/register", async (req, res) => {

      const client = new Client(QUERY_CONFIGURATION);
      await client.connect();
      try {
        // Estrae i dati dalla richiesta POST
        const { Nome, Email, Password } = req.body;

        //const result = await databasepg.inserisciUtente(nomeUtente, emailUtente, passwordUtente);

        const checkQuery = `SELECT COUNT(*) FROM Utenti WHERE Email = $1`;
        const checkUserValues = [Email];

        const userExists = await client.query(checkQuery, checkUserValues);

        if (userExists.rows[0].count > 0) {
          res.status(201).json({ message: "Questo utente è già registrato." });
          return;
        } else {
          // Inserisci l'utente nel database
          const insertQuery = `INSERT INTO Utenti (Nome_Utente, Email, Password_Utente) VALUES ($1, $2, $3)`;
          const insertValues = [Nome, Email, Password];
          const result = await client.query(insertQuery, insertValues);
          const newUser = result.rows[0];

          res.json(newUser);
          return;
        }
        // Simula una risposta di successo
        /*const response = {
              message: 'Utente registrato con successo',
              nome: nomeUtente,
              email: emailUtente,
            };

            res.header('Access-Control-Allow-Origin', '*');
            res.status(200).json(response);
            */
      } catch (error) {
        console.error(error);
        res.status(500).json({error: "Si è verificato un errore durante l inserimento dell utente.", });
      }
      finally {
        await client.end();
      }
    });

    app.post("/", async (req, res) => {
      const client = new Client(QUERY_CONFIGURATION);
      await client.connect();
      try {
        // Estrai i dati dalla richiesta POST
        const { Email, Password } = req.body;
        //const result = await databasepg.loggaUtente(Email, Password);
        const query = `SELECT * FROM Utenti WHERE Email = $1`;

        const values = [Email];
        const result = await client.query(query, values);
        
        if (result.rows.length > 0) {
          
          const user = result.rows[0];
          
          //Caso in cui l'utente esiste ma la password è errata
          if (user.password_utente === Password) {
            res.status(200).json({ message: "Login avvenuto con successo." });
            return;
          } else {
            res.status(202).json({ message: "Password non corretta!" });
            return;
          }
        } else {
          res.status(203).json({ message: "L\'utente non esiste!"})
          return;
        }
        
        res.header("Access-Control-Allow-Origin", "*");
        //res.status(200).json(response);
      } catch (error) {
        console.error(error);
        res.status(500).send("Errore del Server Interno");
      }
      finally {
        await client.end();
      }
    });
  },
};
