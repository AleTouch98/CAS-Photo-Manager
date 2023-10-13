const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const createDB = require('./modules/createDatabase');
const databasepg = require('./modules/queriesDB');
const frontend = require('./modules/frontend');
const cors = require('cors');

const app = express();
const port = 8000;


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());


frontend.createRoutes(app);


createDB.create_database(100);


const server = http.createServer(app);


server.listen(port, () => {
    console.log(`Server in ascolto alla porta ${port}`);
});