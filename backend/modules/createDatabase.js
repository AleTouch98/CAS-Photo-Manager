const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const {CREATE_DB_CONFIGURATION , QUERY_CONFIGURATION } = require("./Configuration");

module.exports = {
    /**
     * Questa funzione crea il db se non esiste già
     * @returns vero se il db è stato creato, falso se il db esiste già
     * @throws un error se non è stato possibile creare il db
     */
    create_database: async (photo_man) => {
        const client = new Client(CREATE_DB_CONFIGURATION);
        const tableClient = new Client(QUERY_CONFIGURATION);
        await client.connect();
        try {
            console.log("Provo a creare il Database");
            await client.query(`CREATE DATABASE photo_man`);
            await client.end();
            await tableClient.connect();
            await tableClient.query("CREATE EXTENSION postgis;");
           
            await create_user_table(tableClient);
            await create_geojson_table(tableClient); //AGGIUNTA CREAZIONE TABELLA DB
            await create_photo_table(tableClient);
            //await create_area_geo_table(tableClient);
            //await create_collection_table(tableClient);
            
            //await create_collab_racc_table(tableClient);
            //await create_geojson_table(tableClient); //AGGIUNTA CREAZIONE TABELLA DB
            console.log('Tabelle e relazioni create');
            console.log("Database Creato");
            return true;
        }
        catch (e) {
            //se il db esiste già ritorna false
            if (e.code === '42P04') {
                console.log("Il database esiste già")
                return false;
            }
            else {
                throw e;
            }
        } 
        finally {
            await tableClient.end();
        }
    },
}



// CREA TABELLA PER UTENTI 
const create_user_table = async (client) => {
    try {
        await client.query(`CREATE TABLE IF NOT EXISTS Utenti (
            ID SERIAL PRIMARY KEY,
            Nome_Utente VARCHAR(255) NOT NULL,
            Email VARCHAR(255) NOT NULL,
            Password_Utente VARCHAR(255) NOT NULL
        )
    `);
            console.log("Tabella utenti creata");
        }
        catch (e) {
            console.error(e);
            return e;
        }
        //inserimento dati di default
        await client.query(`
        INSERT INTO Utenti (Nome_Utente, Email, Password_Utente)
        VALUES
            ('Mbesepp', 'mbesepp@email.com', 'forzamilan'),
            ('Ale', 'ale@email.com', 'forzacagliari'),
            ('Manuel', 'manuel@email.com', 'intermerda');
        `);
             console.log('Caricamento dati utenti effettuato');
        // Creazione del tipo per i ruoli dei collaboratori
        await client.query(`
            CREATE TYPE RuoloCollaboratore AS ENUM ('Visualizzatore', 'Caricatore', 'Commentatore');
        `);
             console.log('Tipo RuoloCollaboratore creato');
    }
    


    // CREA TABELLA PER OSPITARE I GEOJSON
    const create_geojson_table = async (client) => {
        console.log('creo tabella geojson');
        try {
            await client.query(`
            CREATE TABLE geojsonTable (
                ID serial PRIMARY KEY,
                ID_Utente INT REFERENCES Utenti(ID) NOT NULL, 
                GeoJSON_Path TEXT NOT NULL,
                NomeGeoJSON TEXT NOT NULL,
                FeatureDescrittiva TEXT NOT NULL
            )
          `);
            console.log("Tabella geojson creata");
        }
        catch (e) {
            console.error(e);
            return e;
        }
    }


    // CREA TABELLA PER LE FOTO
    const create_photo_table = async (client) => {
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS Foto (
                  ID SERIAL PRIMARY KEY,
                  Immagine BYTEA,
                  Nome_Foto TEXT NOT NULL,
                  ID_Utente INT REFERENCES Utenti(ID) NOT NULL, 
                  Indirizzo TEXT NOT NULL,
                  GeoTag_Spaziale GEOMETRY(Point) NOT NULL,
                  Nome_Collezione TEXT NOT NULL,
                  CONSTRAINT unique_user_photo UNIQUE (ID_Utente, Nome_Foto)
                )
            `);
            console.log("Tabella foto creata");
        }
        catch (e) {
            console.error(e);
            return e;
        }
    }
