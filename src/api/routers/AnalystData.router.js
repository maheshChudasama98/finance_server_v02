const TokenMiddleware = require("../../middlewares/TokenMiddleware");
const Service = require("../services/AnalystData.Services");

module.exports = (app) => {
    // ------------------------ || Routes || ------------------------ //
    app.post("/api/finance/year", TokenMiddleware, Service.FinanceYearService);
    app.post("/api/analyst/category", TokenMiddleware, Service.AccountService);
    app.post("/api/single", TokenMiddleware, Service.SingleDataService);
    app.post("/api/top/categories", TokenMiddleware, Service.TopCategoriesService);
    app.post("/api/top/subcategories", TokenMiddleware, Service.TopSubCategoriesService);
    app.post("/api/data/foll", TokenMiddleware, Service.DataFollService);
    app.get("/api/dashboard", TokenMiddleware, Service.DashboardService);

    app.post("/api/analyst", TokenMiddleware, Service.AnalystService);
};

