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

}

/* -------------------------------------------------------UTILS-----------------------------------------------------------------------------*/


