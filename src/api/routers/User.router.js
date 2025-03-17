const UserService = require("../services/User.Services");
const TokenMiddleware = require("../../middlewares/TokenMiddleware");

module.exports = (app) => {
    app.get("/api/user/info", TokenMiddleware, UserService.UserInfoService);
    app.post("/api/user/list", TokenMiddleware, UserService.UserListService);
    app.post("/api/user/modify", TokenMiddleware, UserService.UserModifyService);
};