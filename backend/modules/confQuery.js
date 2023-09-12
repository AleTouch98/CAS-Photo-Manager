const Pool = require('pg').Pool;

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: 'giuseppepio%99',
    database: 'photo_man',
});

module.exports = pool;