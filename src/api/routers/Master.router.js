const Service = require("../services/Master.Services");
const TokenMiddleware = require("../../middlewares/TokenMiddleware");

module.exports = (app) => {
	// ------------------------ || Categories Service || ------------------------ //
	app.post("/api/categories/list", TokenMiddleware, Service.CategoriesFetchListService);
	app.post("/api/category/modify", TokenMiddleware, Service.CategoryModifyService);
	app.post("/api/category/action", TokenMiddleware, Service.CategoryActionService);
	app.post("/api/category/selected", TokenMiddleware, Service.SelectedCategoryService);

	// ------------------------ || Sub-categories Service || ------------------------ //
	app.post("/api/sub/categories/list", TokenMiddleware, Service.SubCategoriesFetchListService);
	app.post("/api/sub/category/modify", TokenMiddleware, Service.SubCategoryModifyService);
	app.post("/api/sub/category/action", TokenMiddleware, Service.SubCategoryActionService);
	app.post("/api/sub/category/selected", TokenMiddleware, Service.SelectedSubCategoryService);

	// ------------------------ || Labels Service || ------------------------ //
	app.post("/api/labels/list", TokenMiddleware, Service.LabelsFetchListService);
	app.post("/api/label/modify", TokenMiddleware, Service.LabelModifyService);
	app.post("/api/label/action", TokenMiddleware, Service.LabelActionService);
	app.post("/api/label/selected", TokenMiddleware, Service.SelectedLabelService);

	// ------------------------ || Accounts Service || ------------------------ //
	app.post("/api/accounts/list", TokenMiddleware, Service.AccountsFetchListService);
	app.post("/api/account/modify", TokenMiddleware, Service.AccountModifyService);
	app.post("/api/account/action", TokenMiddleware, Service.AccountActionService);
	app.post("/api/account/selected", TokenMiddleware, Service.SelectedAccountService);

	// ------------------------ || Parties Service || ------------------------ //
	app.post("/api/parties/list", TokenMiddleware, Service.PartiesFetchListService);
	app.post("/api/party/modify", TokenMiddleware, Service.PartyModifyService);
	app.post("/api/party/action", TokenMiddleware, Service.PartyActionService)
	app.post("/api/party/selected", TokenMiddleware, Service.SelectedPartyService);;

	// ------------------------ || Longs Service || ------------------------ //
	app.post("/api/loans/list", TokenMiddleware, Service.LongsFetchListService);
	app.post("/api/loan/modify", TokenMiddleware, Service.LongsModifyService);
	app.post("/api/loan/action", TokenMiddleware, Service.LongsActionService);
	app.post("/api/loan/selected", TokenMiddleware, Service.SelectedLongsService);
};
