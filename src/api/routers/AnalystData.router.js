const TokenMiddleware = require("../../middlewares/TokenMiddleware");
const Service = require("../services/AnalystData.Services");

module.exports = (app) => {
    // ------------------------ || Routes || ------------------------ //
    app.post("/api/analyst/category", TokenMiddleware, Service.AccountService);
    // app.post("/api/analyst/subcategory", TokenMiddleware, Service.TransactionFetchListService);
    // app.post("/api/analyst/account", TokenMiddleware, Service.TransactionFetchListService);
};

