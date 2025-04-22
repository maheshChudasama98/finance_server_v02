const UserService = require("../services/User.Services");
const TokenMiddleware = require("../../middlewares/TokenMiddleware");
const cron = require("node-cron");

module.exports = (app) => {
	app.get("/api/user/info", TokenMiddleware, UserService.UserInfoService);
	app.post("/api/user/list", TokenMiddleware, UserService.UserListService);
	app.post("/api/user/modify", TokenMiddleware, UserService.UserModifyService);

	app.get("/api/user/default", TokenMiddleware, UserService.DefaultBrachService);

	app.get("/api/setting", TokenMiddleware, UserService.SettingGetService);
	app.post("/api/setting/modify", TokenMiddleware, UserService.SettingModifyService);

	cron.schedule("* * * * *", () => {
		console.log("Running every 1 minute:", new Date().toISOString());
		// Your task here
	});
};
