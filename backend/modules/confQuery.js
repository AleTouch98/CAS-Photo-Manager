const Pool = require('pg').Pool;

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: 'Mp090998',
    database: 'photo_man',
});

module.exports = pool;