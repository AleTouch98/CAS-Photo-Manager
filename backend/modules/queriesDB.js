const e = require('express');
const { Client } = require('pg');
const { QUERY_CONFIGURATION } = require( './Configuration');
const pgp = require('pg-promise')();


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




inserisciGeoJSON: async (id, geojson, nome, feature) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const query = `
        INSERT INTO geojsonTable (ID_Utente, GeoJSON_Path, NomeGeoJSON, FeatureDescrittiva)
        VALUES ($1, $2, $3, $4);
        `;
        await client.query(query, [id, geojson, nome, feature]);
        return null; // Nessun errore
      } catch (e) {
        console.error('Errore nell\'inserimento del GeoJSON:', e);
        return e; // Restituisci l'errore in caso di fallimento
      } finally {
        await client.end();
      }
},




getListaGeoJSON: async (userID) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const query = `
        SELECT NomeGeoJSON, GeoJSON_Path, FeatureDescrittiva
        FROM geojsonTable
        WHERE ID_Utente = $1;
        `;
        const result = await client.query(query, [userID]);
        const geoJSONList = result.rows.map(row => ({
            nomeGeoJSON: row.nomegeojson,
            geoJSONPath: row.geojson_path,
            featureDescrittiva: row.featuredescrittiva
        }));
        return geoJSONList;
    } catch (e) {
        console.error('Errore nella query per ottenere la lista dei NomeGeoJSON:', e);
        throw e; // Rilancia l'errore in caso di fallimento
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
        VALUES ($1, $2, $3, $4, ST_GeomFromText($5, 4326), $6)
        ON CONFLICT (ID_Utente, Nome_Foto) DO NOTHING;
        `;
        const result = await client.query(query, [foto, nomeFoto, id, indirizzo, point, collezione]);
        if(result.rowCount === 0){
            return false;
        } else {
            return true;
        }
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
        const query = `
        SELECT Foto.ID, Foto.Nome_Foto, Foto.Indirizzo, Utenti.Nome_utente AS Nome_Utente,ST_X(GeoTag_Spaziale) AS longitudine, ST_Y(GeoTag_Spaziale) AS latitudine,
        encode(Foto.Immagine, 'base64') AS ImmagineBase64
        FROM Foto
        INNER JOIN Utenti ON Foto.ID_Utente = Utenti.ID
        WHERE Foto.ID_Utente = $1
        `;
        const result = await client.query(query, [id]);
        return result; // Nessun errore e ritorna il risultato della query
    } catch (e) {
        console.error('Errore nel download delle foto:', e);
        return e; // Restituisci l'errore in caso di fallimento
    } finally {
        await client.end();
    }
},


getFotoUtenteInCollection: async (id, collection) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const query = `
        SELECT Foto.ID, Foto.Nome_Foto, Foto.Indirizzo, Utenti.Nome_utente AS Nome_Utente, ST_X(GeoTag_Spaziale) AS longitudine, ST_Y(GeoTag_Spaziale) AS latitudine,
        encode(Foto.Immagine, 'base64') AS ImmagineBase64
        FROM Foto
        INNER JOIN Utenti ON Foto.ID_Utente = Utenti.ID
        WHERE Foto.ID_Utente = $1 AND Foto.Nome_Collezione = $2
        `;
        const result = await client.query(query, [id, collection]);
        return result; // Nessun errore e ritorna il risultato della query
    } catch (e) {
        console.error('Errore nel download delle foto:', e);
        return e; // Restituisci l'errore in caso di fallimento
    } finally {
        await client.end();
    }
},





getFotoUtenteInPolygon: async (id, polygon) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const query = `
        SELECT Foto.ID, Foto.Nome_Foto, Foto.Indirizzo, ST_X(GeoTag_Spaziale) AS longitudine, ST_Y(GeoTag_Spaziale) AS latitudine, Utenti.Nome_utente AS Nome_Utente,
        encode(Foto.Immagine, 'base64') AS ImmagineBase64
        FROM Foto
        INNER JOIN Utenti ON Foto.ID_Utente = Utenti.ID
        WHERE Foto.ID_Utente = $1
          AND ST_Contains(ST_GeomFromGeoJSON($2), Foto.GeoTag_Spaziale)
        `;
        const result = await client.query(query, [id, polygon]);
        return result; // Nessun errore e ritorna il risultato della query
    } catch (e) {
        console.error('Errore nel download delle foto:', e);
        return e; // Restituisci l'errore in caso di fallimento
    } finally {
        await client.end();
    }
},


cancellaFoto: async (idUtente, idFoto) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
      const query = `
        DELETE FROM Foto
        WHERE ID_Utente = $1
          AND ID = $2;
      `;
      const result = await client.query(query, [idUtente, idFoto]);
      if (result.rowCount === 0) {
        return false; // Nessuna riga cancellata, la foto non esisteva
      } else {
        return true; // La foto è stata cancellata con successo
      }
    } catch (e) {
      console.error('Errore nella cancellazione della foto:', e);
      return e;
    } finally {
      await client.end();
    }
  },
  



getCollezioniUtente: async (id) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const query = `
        SELECT DISTINCT Nome_Collezione
        FROM Foto
        WHERE ID_Utente = $1;
        `;
        const result = await client.query(query, [id]);
        return result; // Nessun errore e ritorna il risultato della query
    } catch (e) {
        console.error('Errore nel download delle foto:', e);
        return e; // Restituisci l'errore in caso di fallimento
    } finally {
        await client.end();
    }
    },

// -------------------------- QUERY PER LA CONDIVISIONE TRA UTENTEI ---------------------------

getNomiUtenti: async (excludedId) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const query = `
            SELECT ID, nome_utente FROM utenti WHERE ID <> $1;
        `;
        const result = await client.query(query, [excludedId]);
        return result;
    } catch (e) {
        console.error(e);
        return e;
    } finally {
        await client.end();
    }
},

getCondivisioniUtente: async (id) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const query = `
        SELECT Utente1 FROM Shares WHERE Utente2 = $1;
        `;
        const result = await client.query(query, [id]);
        return result; // Nessun errore e ritorna il risultato della query
    } catch (e) {
        console.error('Errore nel recupero degli amici: ', e);
        return e; // Restituisci l'errore in caso di fallimento
    } finally {
        await client.end();
    }
},



aggiungiCondivisione: async (id1, id2) => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const query = `
        INSERT INTO Shares (Utente1, Utente2) VALUES ($1, $2);
        `;
        const result = await client.query(query, [id1, id2]);
        return true; // Nessun errore e ritorna il risultato della query
    } catch (e) {
        console.error('Errore nell\'inserimento della condivisione: ', e);
        return e; // Restituisci l'errore in caso di fallimento
    } finally {
        await client.end();
    }
    },





}



/* -------------------------------------------------------UTILS-----------------------------------------------------------------------------*/
