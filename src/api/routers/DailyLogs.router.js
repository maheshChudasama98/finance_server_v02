const controller = require("../services/DailyLogs.Services");

module.exports = (app) => {
    app.post("/api/daily/log/modify", controller.DailyLogModifyService);
    app.post("/api/daily/log/list", controller.FetchDailyLogListService);
};