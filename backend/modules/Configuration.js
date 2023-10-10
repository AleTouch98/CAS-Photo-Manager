const CREATE_DB_CONFIGURATION = {
    host: 'db', // Utilizza il nome del servizio del database come hostname
    user: 'postgres',
    port: 5432,
    password: 'Mp090998',
}

const QUERY_CONFIGURATION = {
    host: 'db',
    user: 'postgres',
    port: 5432 ,
    password: 'Mp090998',
    database: 'photo_man',
}

module.exports = {CREATE_DB_CONFIGURATION, QUERY_CONFIGURATION};

