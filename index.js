// ------------ ||  Express package  || ------------ //
// require("./src/helpers/EnvCheck.helper")(process, process.argv[2]);

require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");
const path = require("path");
const http = require("http");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const {DefaultDatabaseAction, DefaultEmailSet} = require("./src/api/controllers/Basic.controller");
const {serverRestarted} = require("./src/helpers/Email.helper");

// --------------------------------------------------------------------------

app.use(express.json()); // express in json data fetch for user
app.use(cors());
app.options("*", cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true}));

app.use(fileUpload()); // Enable files upload
app.use(express.static(path.join(__dirname, "/public"))); // Static folder for serving files
app.use("/public", express.static(path.join(__dirname, "public")));

require("./src/api/models/index"); //  All Models and Database connection
require("./src/api/routers/index")(app); // All Router index

setTimeout(
	async () => {
		console.log("Executing task...");
		await DefaultEmailSet();
		await serverRestarted();
		// await  DefaultDatabaseAction();
	},
	1 * 60 * 1000,
);

const server = http.createServer(app);
const port = process.env.PORT || 3000;

// ------------ ||  Server Listen Port  || ------------ //

server.listen(port, (error) => {
	if (error) {
		console.error("\x1b[91mServer error \x1b[91m", error);
	} else {
		console.log(`\x1b[92mServer is running on port -- ${port}\x1b[39m `);
	}
});
