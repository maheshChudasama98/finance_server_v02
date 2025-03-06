const Service = require("../services/Kanban.Services");
const TokenMiddleware = require("../../middlewares/TokenMiddleware");

module.exports = (app) => {
    app.post("/api/kanban/topic/modify", TokenMiddleware, Service.TopicModifyService);
    app.post("/api/kanban/topic/remove", TokenMiddleware, Service.TopicRemoveService);
    app.post("/api/kanban/topic/list", TokenMiddleware, Service.TopicListService);
    app.post("/api/kanban/topic/sorting", TokenMiddleware, Service.TopicDragSortingService);


    app.post("/api/kanban/task/modify", TokenMiddleware, Service.TaskModifyService);
    app.post("/api/kanban/task/list", TokenMiddleware, Service.TaskListService);
    app.delete("/api/kanban/task/remove", TokenMiddleware, Service.TaskRemoveService);
    app.post("/api/kanban/task/sorting", TokenMiddleware, Service.TaskDragSortingService);
};

