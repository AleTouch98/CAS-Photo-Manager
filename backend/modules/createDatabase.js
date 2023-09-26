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
           // await initialize_zone_table(total_parking_zone1, tableClient);
           // await initialize_charge_stations_table(tableClient);
            await create_user_table(tableClient);
            console.log('creata tabella utenti');
            await create_geojson_table(tableClient); //AGGIUNTA CREAZIONE TABELLA DB
            console.log('creata tabella geojson');
            //await create_area_geo_table(tableClient);
            //await create_collection_table(tableClient);
            //await create_photo_table(tableClient);
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
                ID_Utente INT REFERENCES Utenti(ID), 
                GeoJSON_Path TEXT,
                NomeGeoJSON TEXT  
            )
          `);
            console.log("Tabella geojson creata");
        }
        catch (e) {
            console.error(e);
            return e;
        }
    }




    

/** 
 * questa funzione trasforma un geojson in una stringa di coordinate
 * @param {geojson} geojson il file geojson
 * @returns las stringa di coordinate
*/
const transformGeojsonToPolygonList = (geojson) => {
    const coordinatesList = geojson.geometry.coordinates.flat(1);
    let geom = '';
    coordinatesList.forEach(element => {
        geom += `${element[0]} ${element[1]}, `;
    });
    geom = geom.substring(0, geom.length - 2); //rimuove l'ultima virgola e l'ultimo spazio
    return geom;
}


    
/**
 * Questa funzione crea una tabella area geografica  
 * Essa contiene 3 campi:
 * id: id dell'area geografica
 * Nome_area: nome dell'area geografica
 * Dati_geojason: dati geojson dell'area geografica
 * @param {*} client il client del db
 */
const create_area_geo_table = async (client) => {
    try {
        await client.query(`
        CREATE TABLE IF NOT EXISTS Aree_Geografiche (
            ID_Area SERIAL PRIMARY KEY,
            Nome_Area VARCHAR(255) NOT NULL,
            Dati_GEOJSON JSONB NOT NULL
        )
    `);
        console.log("Tabella aree geografiche creata");
    }
    catch (e) {
        console.error(e);
        return e;
    }
}


/**
 * Questa funzione crea una tabella delle collezioni  
 * Essa contiene 5 campi:
 * id_collezione: id della collezione
 * Nome_collezione: nome della collezione
 * Descrizione: descrizione della collezione
 * Id_Utente_titolare: id dell'utente titolare della collezione
 * Id_foto_copertina: id della foto di copertina della collezione
 * @param {*} client il client del db
 */
const create_collection_table = async (client) => {
    try {
        await client.query(`
        CREATE TABLE IF NOT EXISTS Collezioni (
          ID SERIAL PRIMARY KEY,
          Nome VARCHAR(255),
          Descrizione TEXT,
          ID_Utente_Titolare INT REFERENCES Utenti(ID),
          ID_Foto_Copertina INT 
        )
      `);
        console.log("Tabella aree geografiche creata");
    }
    catch (e) {
        console.error(e);
        return e;
    }
}


/**
 * Questa funzione crea una tabella delle foto  
 * Essa contiene 5 campi:
 * id: id delle foto
 * Nome_file: nome della foto
 * Percorso file: percorso della foto
 * Id_Utente_Caricatore: id dell'utente che ha caricato la foto
 * Id_Collezione: Id della collezione a cui appartiene la foto
 * @param {*} client il client del db
 */
const create_photo_table = async (client) => {
    try {
        await client.query(`
        CREATE TABLE IF NOT EXISTS Foto (
          ID SERIAL PRIMARY KEY,
          Nome_File VARCHAR(255),
          Percorso_File VARCHAR(255),
          Geo_Tag_Spaziale GEOMETRY(Point),
          ID_Utente_Caricatore INT REFERENCES Utenti(ID),
          ID_Collezione INT REFERENCES Collezioni(ID)
        )
      `);
        console.log("Tabella foto creata");
    }
    catch (e) {
        console.error(e);
        return e;
    }

    // Impostazione chiave secondaria per Collezioni
await client.query(`
ALTER TABLE Collezioni
ADD CONSTRAINT FK_Collezioni_Foto
FOREIGN KEY (ID_Foto_Copertina) REFERENCES Foto(ID)
`);
console.log('Impostazione chiave secondaria per Collezioni creata');

}


/**
 * Questa funzione crea una tabella delle foto  
 * Essa contiene 4 campi:
 * id: id collaboratore
 * id_collezione: id della collezione
 * Id_utente_collaboratore: Id dell'utente collaboratore
 * Ruolo_collaboratore: tipo di ruolo del collaboratore
 * @param {*} client il client del db
 */
const create_collab_racc_table = async (client) => {
    try {
        await client.query(`
        CREATE TABLE Collaboratori_Raccolte (
          ID SERIAL PRIMARY KEY,
          ID_Collezione INT REFERENCES Collezioni(ID),
          ID_Utente_Collaboratore INT REFERENCES Utenti(ID),
          Ruolo_Collaboratore RuoloCollaboratore
        )
      `);
        console.log("Tabella foto creata");
    }
    catch (e) {
        console.error(e);
        return e;
    }
}







