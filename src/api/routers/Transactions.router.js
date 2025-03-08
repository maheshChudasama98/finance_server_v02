const TokenMiddleware = require("../../middlewares/TokenMiddleware");
const Service = require("../services/Transactions.Services");

module.exports = (app) => {
    // ------------------------ || Routes || ------------------------ //
    app.post("/api/transaction/modify", TokenMiddleware, Service.TransactionModifyService);
    app.post("/api/transaction/list", TokenMiddleware, Service.TransactionFetchListService);
    app.get("/api/transaction/data", TokenMiddleware, Service.TransactionFetchDataService);
    app.delete("/api/transaction/remove", TokenMiddleware, Service.TransactionRemoveService);

};

