const pool = require('./ConfQuery');
const queries = require('./queries');
//console.log(pool);


const getUtenti = (req, res) => {
    pool.query(queries.getUtenti, (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
    console.log("Utenti presi");
}
module.exports = {  
    getUtenti,
};