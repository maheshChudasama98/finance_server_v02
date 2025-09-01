const {ENGLISH} = require("../constants/messages");
const cron = require("node-cron");
const {createTransactionStatement, createStatementPDF} = require("../../helpers/PDF.helper");

// ------------ || Include all routers file over here  || ------------ //

module.exports = (app) => {
	// ------------ || Default route path  || ------------ //

	app.get("/", (req, res) => {
		try {
			return res.status(200).send(ENGLISH.DEFAULT_PATH);
		} catch (error) {
			return res.status(500).send({status: false, message: error.message});
		}
	});

	require("./Org.router")(app);
	require("./Auth.router")(app);
	require("./User.router")(app);

	// ------------ || Base on project  || ------------ //
	require("./DailyLogs.router")(app);
	require("./Master.router")(app);
	require("./Transactions.router")(app);
	require("./AnalystData.router")(app);
	require("./Kanban.router")(app);

	cron.schedule("59 23 * * *", () => {
		const now = new Date();
		const tomorrow = new Date(now);
		tomorrow.setDate(now.getDate() + 1);

		if (tomorrow.getDate() === 1) {
			createTransactionStatement();
		}
	});

	// app.get("/download", async (req, res) => {
	// 	try {
	// 		console.log("datadatadata");
	// 		const data = await createStatementPDF(1, 1, 2);
	// 		console.log(data, "datadatadata");
	// 		return res.status(200).send(ENGLISH.DEFAULT_PATH);
	// 	} catch (error) {
	// 		return res.status(500).send({status: false, message: error.message});
	// 	}
	//});
};
