const Service = require("../services/Org.Services");
const TokenMiddleware = require("../../middlewares/TokenMiddleware");

module.exports = (app) => {
    // ------------------------ || Org Routes || ------------------------ //
    app.post("/api/org/modify", TokenMiddleware, Service.OrgModifyService);
    app.post("/api/org/list", TokenMiddleware, Service.OrgListService);
    app.delete("/api/org/remove", TokenMiddleware, Service.OrgRemoveService);
    app.get("/api/org/active", TokenMiddleware, Service.OrgActiveService);


    // ------------------------ || Branches Routes || ------------------------ //
    app.post("/api/branch/modify", TokenMiddleware, Service.BranchModifyService);
    app.post("/api/branch/list", TokenMiddleware, Service.BranchListService);
    app.delete("/api/branch/remove", TokenMiddleware, Service.BranchRemoveService);
    app.get("/api/branch/active", TokenMiddleware, Service.BranchActiveService);


    // ------------------------ || Modules Routes || ------------------------ //
    app.post("/api/module/modify", TokenMiddleware, Service.ModuleModifyService);
    app.post("/api/module/list", TokenMiddleware, Service.ModuleListService);
    app.delete("/api/module/remove", TokenMiddleware, Service.ModuleRemoveService);
    app.get("/api/module/active", TokenMiddleware, Service.ModuleActiveService);


    // ------------------------ || Roles Routes || ------------------------ //
    app.post("/api/role/modify", TokenMiddleware, Service.RoleModifyService);
    app.post("/api/role/list", TokenMiddleware, Service.RoleListService);
    app.delete("/api/role/remove", TokenMiddleware, Service.RoleRemoveService);
    app.get("/api/role/active", TokenMiddleware, Service.RoleActiveService);

    // ------------ || Base on project  || ------------ //
    
};

