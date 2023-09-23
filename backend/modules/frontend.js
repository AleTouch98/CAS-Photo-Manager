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

    app.post("/", async (req, res) => {
      try {
        const { Email, Password } = req.body; // Estrai i dati dalla richiesta POST
        const result = await databasepg.loggaUtente(Email, Password); // Passa i parametri Email e Password
        if (result != null) {
          const user = result;
          // Caso in cui l'utente esiste ma la password è errata
          if (user.password_utente === Password) {
            res.status(200).json({ message: "Login avvenuto con successo." });
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

  },
};
