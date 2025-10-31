const TokenMiddleware = require("../../middlewares/TokenMiddleware");
const Service = require("../services/AnalystData.Services");

module.exports = (app) => {
	// ------------------------ || Routes || ------------------------ //

	// This api for main Dashboard basic details
	app.post("/api/dashboard", TokenMiddleware, Service.DashboardService); // This api for main Dashboard To find current year and month details
	app.post("/api/balance/overview", TokenMiddleware, Service.BalanceOverviewService);
	app.post("/api/top/categories", TokenMiddleware, Service.TopCategoriesService);
	app.post("/api/top/subcategories", TokenMiddleware, Service.TopSubCategoriesService);
	app.post("/api/recode/list", TokenMiddleware, Service.RecodeListService);
	app.post("/api/recode/performance", TokenMiddleware, Service.PerformanceService);
	app.post("/api/balance/foll", TokenMiddleware, Service.BalanceFollService);
	app.post("/api/saving/foll", TokenMiddleware, Service.SavingFollService);
	app.post("/api/monthly/report", TokenMiddleware, Service.MonthlyReportService);
	app.post("/api/monthly/detailed-summary", TokenMiddleware, Service.MonthlyDetailedSummaryService);
	
	// Account-Based Analytics Routes
	app.post("/api/account/overview", TokenMiddleware, Service.AccountOverviewService);
	app.post("/api/account/details", TokenMiddleware, Service.AccountDetailsService);
};
