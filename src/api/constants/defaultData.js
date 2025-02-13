require('dotenv').config();

module.exports.defaultOrgDetails = {
    OrgName: process.env.DEFAULT_ORG || "Default Org",
    Description: "Default Org"
};

module.exports.defaultBranchDetails = {
    BranchName: "Main Branch",
    Description: "Default Branch",
    Address: "Default Branch",
    City: "Default Branch",
    State: "Default Branch",
    GstNumber: "Default Branch",
    Phone: "Default Branch",
    Email: "Default Branch",
};

module.exports.roleList = [
    { RoleName: "User Admin", Description: "All Right have" },
    { RoleName: "Admin", Description: "Admin" },
    { RoleName: "User", Description: "User" },
    { RoleName: "Manager", Description: "Manager" },
];

module.exports.modulesList = [
    { ModulesName: "Dashboard", Description: "Dashboard details", Router: "/dashboard" },
    { ModulesName: "Users", Description: "Users details", Router: "/user" },
    { ModulesName: "Accounts", Description: "Accounts details", Router: "/accounts" },
    { ModulesName: "Setting", Description: "Setting details", Router: "/setting" },
    { ModulesName: "Profile", Description: "Profile details", Router: "/profile" },
];