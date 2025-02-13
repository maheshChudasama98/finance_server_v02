// ------------ ||  Express package  || ------------ //

require('dotenv').config(); // dotenv package need for access .env file

const express = require("express")
const app = express()
const port = process.env.PORT || 9001;
const cors = require('cors')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require("path");
const { DefaultDatabaseAction, SuperAdminDatabaseAction } = require('./src/api/controllers/Basic.controller');

app.use(express.json()); // express in json data fetch for user 
app.use(cors());
app.options('*', cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(fileUpload());// Enable files upload
app.use(express.static(path.join(__dirname, '/public'))); // Static folder for serving files
app.use('/public', express.static(path.join(__dirname, 'public')));

require('./src/api/models/index'); //  All Models and Database connection  
require('./src/api/routers/index')(app); // All Router index

// DefaultDatabaseAction();

// ------------ ||  Server listen port  || ------------ //
app.listen(port, error => {
    error == null ?
        console.log(`\x1b[92mServer is running on port ${port}\x1b[39m `)
        : console.log("\x1b[91mServer error \x1b[91m", error)
})