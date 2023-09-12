//Qui inseriamo tutte le query che esportiamo e le utilizziamo nel controller per creare i vari routes
const getUtenti = 'SELECT * FROM Utenti ORDER BY id ASC';

module.exports = {
    getUtenti,
};