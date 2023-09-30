const e = require('express');
const { Client } = require('pg');
const { QUERY_CONFIGURATION } = require( './Configuration');

/*
Per resettare l'autoincrement di una tabella
DELETE FROM history;
DELETE FROM user_events;
SELECT setval(pg_get_serial_sequence('history', 'id_event'), 1);
SELECT setval(pg_get_serial_sequence('user_events', 'id_user'), 1);
*/


module.exports = { 

inserisciUtente: async (Nome, Email, Password) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
    const checkQuery = `SELECT COUNT(*) FROM Utenti WHERE Email = $1`;
    const checkUserValues = [Email];
    const userExists = await client.query(checkQuery, checkUserValues);
    if (userExists.rows[0].count > 0) {
        return false;
    } else {
        const insertQuery = `INSERT INTO Utenti (Nome_Utente, Email, Password_Utente) VALUES ($1, $2, $3)`;
        const insertValues = [Nome, Email, Password];
        const result = await client.query(insertQuery, insertValues);
        return true;
    }
    } catch (e) {
        console.error(e);
        return e;
    } finally {
    await client.end();
    }
},


loggaUtente: async (Email) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const query = `
            SELECT * FROM Utenti WHERE email = $1 ;
            `;
        const values = [Email];
        const result = await client.query(query, values);
        if (result.rows.length === 1) {
            // L'utente è stato trovato
            return result.rows[0];
        } 
        return null;
    } catch (e) {
        console.error(e);
        return e; 
    } finally {
        await client.end();
    }
},


// -------------------------- FINE DELLE QUERY PER IL LOGIN ---------------------------

//con questa query una volta aperta la dashboard (da cui si preleva l'id) viene recuperato il nome dell'utente per stamparlo a video
//si potrebbe pensare anche di recuperare direttamente l'utente.
getNomeUtenteById: async (id) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const query = `
            SELECT nome_utente FROM utenti WHERE id = $1;
            `;
        const values = [id];
        const result = await client.query(query, values);
        if (result.rows.length === 1) {
            // Restituisci il nome dell'utente se trovato
            return result.rows[0].nome_utente;
        } else {
            return null;
        }
    } catch (e) {
        console.error(e);
        return e; // Gestione dell'errore: restituisci null in caso di errore
    } finally {
        await client.end();
    }
},





inserisciFoto: async (id, nomeFoto, foto, indirizzo, longitudine, latitudine, collezione) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const point = `POINT(${parseFloat(longitudine)} ${parseFloat(latitudine)})`;
        const query = `
        INSERT INTO Foto (Immagine, Nome_Foto, ID_Utente, Indirizzo, GeoTag_Spaziale, Nome_Collezione)
        VALUES ($1, $2, $3, $4,  ST_GeomFromText($5, 4326), $6);
        `;
        await client.query(query, [foto, nomeFoto, id, indirizzo, point, collezione]);
        return null;
    } catch (e) {
        console.error('Errore nell\'inserimento della foto:', e);
        return e;
    } finally {
        await client.end();
    }
},




getFotoUtente: async (id) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const query = 'SELECT ID, Nome_Foto, Indirizzo, encode(Immagine, \'base64\') AS ImmagineBase64 FROM Foto WHERE ID_Utente = $1';
        const result = await client.query(query, [id]);
        return result; // Nessun errore e ritorna il risultato della query
    } catch (e) {
        console.error('Errore nel download delle foto:', e);
        return e; // Restituisci l'errore in caso di fallimento
    } finally {
        await client.end();
    }
},




inserisciGeoJSON: async (id, geojson, nome) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const query = `
        INSERT INTO geojsonTable (ID_Utente, GeoJSON_Path, NomeGeoJSON)
        VALUES ($1, $2, $3);
        `;
        await client.query(query, [id, geojson, nome]);
        return null; // Nessun errore
      } catch (e) {
        console.error('Errore nell\'inserimento del GeoJSON:', e);
        return e; // Restituisci l'errore in caso di fallimento
      } finally {
        await client.end();
      }
},

getListaGeoJSON: async () => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const query = `
        SELECT NomeGeoJSON, GeoJSON_Path
        FROM geojsonTable;
        `;
        const result = await client.query(query);
        const geoJSONList = result.rows.map(row => ({
            nomeGeoJSON: row.nomegeojson,
            geoJSONPath: row.geojson_path // Assicurati che il nome della colonna sia corretto
        }));
        return geoJSONList;
    } catch (e) {
        console.error('Errore nella query per ottenere la lista dei NomeGeoJSON:', e);
        throw e; // Rilancia l'errore in caso di fallimento
    } finally {
        await client.end();
    }
},


}

/* -------------------------------------------------------UTILS-----------------------------------------------------------------------------*/
