const CREATE_DB_CONFIGURATION = {
    host: 'db-service', // nome del servizio del database come hostname
    user: 'postgres',
    port: 5432,
    password: 'cas2023',
}

const QUERY_CONFIGURATION = {
    host: 'db-service',
    user: 'postgres',
    port: 5432 ,
    password: 'cas2023',
    database: 'photo_man',
}

module.exports = {CREATE_DB_CONFIGURATION, QUERY_CONFIGURATION};

