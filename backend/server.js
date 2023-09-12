const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const createDB = require('./modules/createDatabase');
const frontroutes = require('./modules/routes');
const cors = require('cors');

//const userActivity = require('./modules/userActivity');
/*
PER QUERY E CHIAMATE API PER IL FRONTEND
const frontend = require('./modules/frontend');
const databasepg = require('./modules/databaseQueries');


*/

const app = express();
const port = 8000;


// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());

/*
frontend.createRoutes(app);
userActivity.createRoutes(app);
*/

createDB.create_database(100);

const server = http.createServer(app);

app.use(express.json());
app.use('/api', frontroutes);

server.listen(port, () => {
    console.log(`Server in ascolto alla porta ${port}`);
});