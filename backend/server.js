const http = require('http');
const express = require('express');
//const bodyParser = require('body-parser');
//const userActivity = require('./modules/userActivity');
/*
PER QUERY E CHIAMATE API PER IL FRONTEND
const frontend = require('./modules/frontend');
const databasepg = require('./modules/databaseQueries');

const createDB = require('./modules/createDatabase');
const cors = require('cors');
*/
const app = express();
const port = 8000;

/*
SE DOVESSE SERVIRE ABBIAMO GIA IL BODYPARSER
// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());


frontend.createRoutes(app);
userActivity.createRoutes(app);


createDB.create_database(100);
*/

const server = http.createServer(app);


server.listen(port, () => {
    console.log(`Server in ascolto alla porta ${port}`);
});