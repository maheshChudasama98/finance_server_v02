const { ENGLISH } = require("../constants/messages");

// ------------ || Include all routers file over here  || ------------ //

module.exports = (app) => {

    // ------------ || Default route path  || ------------ //

    app.get("/", (req, res) => {
        try {
            return res.status(200).send(ENGLISH.DEFAULT_PATH)
        } catch (error) {
            return res.status(500).send({ status: false, message: error.message })
        };
    });

    require("./Org.router")(app);
    require("./Auth.router")(app);
    require("./User.router")(app);

    // ------------ || Base on project  || ------------ //
    require("./DailyLogs.router")(app);
    require("./Master.router")(app);
    require("./Transactions.router")(app);
    require("./AnalystData.router")(app);
};
