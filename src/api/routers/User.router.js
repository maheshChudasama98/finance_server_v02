const UserService = require("../services/User.Services");
const TokenMiddleware = require("../../middlewares/TokenMiddleware");

module.exports = (app) => {
    app.get("/api/user/info", TokenMiddleware, UserService.UserInfoService);
    app.post("/api/user/modify", TokenMiddleware, UserService.UserModifyService);
    app.get("/api/user/list", TokenMiddleware, UserService.FetchUserListService);

    // ------------ || Base on project  || ------------ //
};