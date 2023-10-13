const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const {CREATE_DB_CONFIGURATION , QUERY_CONFIGURATION } = require("./Configuration");

module.exports = {

    // CREA IL DB 
    create_database: async (photo_man) => {
        console.log('provo a creare il database');
        const client = new Client(CREATE_DB_CONFIGURATION);
        const tableClient = new Client(QUERY_CONFIGURATION);
      console.log('create client e tableclient');
        await client.connect();
      console.log('connesso al db');
        try {
            console.log("Provo a creare il Database");
            await client.query(`CREATE DATABASE photo_man`);
            await client.end();
            await tableClient.connect();
            await tableClient.query("CREATE EXTENSION postgis;");
           
            await create_user_table(tableClient);
            await create_geojson_table(tableClient);
            await create_photo_table(tableClient);
            await create_shares_table(tableClient);

            console.log('Tabelle e relazioni create');
            console.log("Database Creato");
            return true;
        }
        catch (e) {
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
    }
    


    // CREA TABELLA PER I GEOJSON
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

    // CREA TABELLA PER LE CONDIVISIONI l'utente 1 condivide con l'utente 2
    const create_shares_table = async (client) => {
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS Shares (
                  ID SERIAL PRIMARY KEY,
                  Utente1 INT REFERENCES Utenti(ID) NOT NULL, 
                  Utente2 INT REFERENCES Utenti(ID) NOT NULL,
                  CONSTRAINT unique_share_users UNIQUE (Utente1, Utente2)
                )
            `);
            console.log("Tabella shares creata");
        }
        catch (e) {
            console.error(e);
            return e;
        }
    }
