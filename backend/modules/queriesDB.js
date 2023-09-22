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
    
    /**
     * This function return all the users in the database
     * @returns all the users in the database
    */
   getAllUtenti: async () => {
    const client = new Client(QUERY_CONFIGURATION);
    await client.connect();
    try {
        const result = await client.query(`SELECT * FROM Utenti ORDER BY id ASC`);
        return result;
    } catch (e) {
        console.error(e);
    }
    finally {
        await client.end();
    }
},  


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
        // Inserisci l'utente nel database
        const insertQuery = `INSERT INTO Utenti (Nome_Utente, Email, Password_Utente) VALUES ($1, $2, $3)`;
        const insertValues = [Nome, Email, Password];
        const result = await client.query(insertQuery, insertValues);
        return true;
    }
    } catch (error) {
        console.error(error);
        return null;
        //res.status(500).json({error: "Si è verificato un errore durante l inserimento dell utente.", });
    } finally {
    await client.end();
    }
},


loggaUtente: async (Email, Password) => {
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
            console.log("Utente Loggato.");
            return result.rows[0];
        } else {
            // Nessun utente trovato, il login non ha avuto successo
            console.log("L'utente non esiste o la password è sbagliata.");
            return null;
        }
    } catch (e) {
        console.error(e);
        return null; // Gestione dell'errore: restituisci null in caso di errore
    } finally {
        await client.end();
    }
},








}

/* -------------------------------------------------------UTILS-----------------------------------------------------------------------------*/


