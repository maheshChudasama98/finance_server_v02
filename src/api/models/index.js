const { sequelize, DataTypes } = require('../../configs/Database.config');

const db = {};

db.OrgModel = require("./Org.model")(sequelize, DataTypes);
db.BranchesModel = require("./Branches.model")(sequelize, DataTypes);
db.ModulesModel = require("./Modules.model")(sequelize, DataTypes);
db.RolesModel = require("./Roles.model")(sequelize, DataTypes);
db.PermissionModel = require("./Permission.model")(sequelize, DataTypes);

db.UserModel = require("./Users.model")(sequelize, DataTypes);
db.OrgUsersModel = require("./OrgUsers.model")(sequelize, DataTypes);
db.FilesModel = require("./Files.model")(sequelize, DataTypes);

// ------------ || Base on project || ------------ //

db.DailyLogsModel = require("./DailyLogs.model")(sequelize, DataTypes);

// ------------ || Finances on project || ------------ //

db.AccountsModel = require("./Accounts.model")(sequelize, DataTypes);
db.CategoriesModel = require("./Categories.model")(sequelize, DataTypes);
db.SubCategoriesModel = require("./SubCategories.model")(sequelize, DataTypes);
db.LabelsModel = require("./Labels.model")(sequelize, DataTypes);
db.PartiesModel = require("./Parties.model")(sequelize, DataTypes);
db.TransactionsModel = require("./Transactions.model")(sequelize, DataTypes);

// --- Kanban Models Here --- //

db.TopicsModel = require("./Topics.model")(sequelize, DataTypes);
db.TasksModel = require("./Tasks.model")(sequelize, DataTypes);


// --- || Orgs || --- //

db.OrgModel.hasMany(db.BranchesModel, { foreignKey: 'OrgId' });  // One to Many;
db.BranchesModel.belongsTo(db.OrgModel, { foreignKey: 'OrgId' });

db.OrgModel.hasMany(db.ModulesModel, { foreignKey: 'OrgId' });  // One to Many;
db.ModulesModel.belongsTo(db.OrgModel, { foreignKey: 'OrgId' });

db.BranchesModel.hasMany(db.ModulesModel, { foreignKey: 'BranchId' });  // One to Many;
db.ModulesModel.belongsTo(db.BranchesModel, { foreignKey: 'BranchId' });

db.ModulesModel.hasMany(db.ModulesModel, { foreignKey: 'ParentNoteId' });  // Self Join;
db.ModulesModel.belongsTo(db.ModulesModel, { foreignKey: 'ParentNoteId' });

db.ModulesModel.hasMany(db.PermissionModel, { foreignKey: 'ModuleId' });  // One to Many;
db.PermissionModel.belongsTo(db.ModulesModel, { foreignKey: 'ModuleId' });

db.OrgModel.hasMany(db.RolesModel, { foreignKey: 'OrgId' });  // One to Many;
db.RolesModel.belongsTo(db.OrgModel, { foreignKey: 'OrgId' });

db.BranchesModel.hasMany(db.RolesModel, { foreignKey: 'BranchId' });  // One to Many;
db.RolesModel.belongsTo(db.BranchesModel, { foreignKey: 'BranchId' });

db.RolesModel.hasMany(db.PermissionModel, { foreignKey: 'RoleId' }); // One to Many;
db.PermissionModel.belongsTo(db.RolesModel, { foreignKey: 'RoleId' });

// --- || Orgs-Users Model || --- //

db.UserModel.hasMany(db.OrgUsersModel, { foreignKey: 'UserId' });  // --- One To Many --- //;
db.OrgUsersModel.belongsTo(db.UserModel, { foreignKey: 'UserId' });

db.OrgModel.hasMany(db.OrgUsersModel, { foreignKey: 'OrgId' });  // --- One To Many --- //;
db.OrgUsersModel.belongsTo(db.OrgModel, { foreignKey: 'OrgId' });

db.BranchesModel.hasMany(db.OrgUsersModel, { foreignKey: 'BranchId' });  // --- One To Many --- //;
db.OrgUsersModel.belongsTo(db.BranchesModel, { foreignKey: 'BranchId' });

db.RolesModel.hasMany(db.OrgUsersModel, { foreignKey: 'RoleId' }); // --- One To Many --- //;
db.OrgUsersModel.belongsTo(db.RolesModel, { foreignKey: 'RoleId' });

// ------------ || Base on project  || ------------ //

db.UserModel.hasMany(db.DailyLogsModel, { foreignKey: 'UserId' }); // --- One To Many --- //;
db.DailyLogsModel.belongsTo(db.UserModel, { foreignKey: 'UserId' });


// ------------ || Finances on project  || ------------ //

db.UserModel.hasMany(db.AccountsModel, { foreignKey: 'UsedBy' });  // One to Many;
db.AccountsModel.belongsTo(db.UserModel, { foreignKey: 'UsedBy' });

db.OrgModel.hasMany(db.AccountsModel, { foreignKey: 'OrgId' });  // One to Many;
db.AccountsModel.belongsTo(db.OrgModel, { foreignKey: 'OrgId' });

db.BranchesModel.hasMany(db.AccountsModel, { foreignKey: 'BranchId' });  // One to Many;
db.AccountsModel.belongsTo(db.BranchesModel, { foreignKey: 'BranchId' });

// --------------------------- // 

db.UserModel.hasMany(db.CategoriesModel, { foreignKey: 'UsedBy' });  // One to Many;
db.CategoriesModel.belongsTo(db.UserModel, { foreignKey: 'UsedBy' });

db.OrgModel.hasMany(db.CategoriesModel, { foreignKey: 'OrgId' });  // One to Many;
db.CategoriesModel.belongsTo(db.OrgModel, { foreignKey: 'OrgId' });

db.BranchesModel.hasMany(db.CategoriesModel, { foreignKey: 'BranchId' });  // One to Many;
db.CategoriesModel.belongsTo(db.BranchesModel, { foreignKey: 'BranchId' });

// --------------------------- // 

db.UserModel.hasMany(db.SubCategoriesModel, { foreignKey: 'UsedBy' });  // One to Many;
db.SubCategoriesModel.belongsTo(db.UserModel, { foreignKey: 'UsedBy' });

db.OrgModel.hasMany(db.SubCategoriesModel, { foreignKey: 'OrgId' });  // One to Many;
db.SubCategoriesModel.belongsTo(db.OrgModel, { foreignKey: 'OrgId' });

db.BranchesModel.hasMany(db.SubCategoriesModel, { foreignKey: 'BranchId' });  // One to Many;
db.SubCategoriesModel.belongsTo(db.BranchesModel, { foreignKey: 'BranchId' });

db.CategoriesModel.hasMany(db.SubCategoriesModel, { foreignKey: 'CategoryId' });  // One to Many;
db.SubCategoriesModel.belongsTo(db.CategoriesModel, { foreignKey: 'CategoryId' });

// --------------------------- // 

db.UserModel.hasMany(db.LabelsModel, { foreignKey: 'UsedBy' });
db.LabelsModel.belongsTo(db.UserModel, { foreignKey: 'UsedBy' });

db.OrgModel.hasMany(db.LabelsModel, { foreignKey: 'OrgId' });
db.LabelsModel.belongsTo(db.OrgModel, { foreignKey: 'OrgId' });

db.BranchesModel.hasMany(db.LabelsModel, { foreignKey: 'BranchId' });
db.LabelsModel.belongsTo(db.BranchesModel, { foreignKey: 'BranchId' });

// --------------------------- // 

db.UserModel.hasMany(db.PartiesModel, { foreignKey: 'UsedBy' });
db.PartiesModel.belongsTo(db.UserModel, { foreignKey: 'UsedBy' });

db.OrgModel.hasMany(db.PartiesModel, { foreignKey: 'OrgId' });
db.PartiesModel.belongsTo(db.OrgModel, { foreignKey: 'OrgId' });

db.BranchesModel.hasMany(db.PartiesModel, { foreignKey: 'BranchId' });
db.PartiesModel.belongsTo(db.BranchesModel, { foreignKey: 'BranchId' });

// --------------------------- // 

db.OrgModel.hasMany(db.TransactionsModel, { foreignKey: 'OrgId' });
db.TransactionsModel.belongsTo(db.OrgModel, { foreignKey: 'OrgId' });

db.UserModel.hasMany(db.TransactionsModel, { foreignKey: 'UsedBy' });
db.TransactionsModel.belongsTo(db.UserModel, { foreignKey: 'UsedBy' });

db.PartiesModel.hasMany(db.TransactionsModel, { foreignKey: 'PartyId' });
db.TransactionsModel.belongsTo(db.PartiesModel, { foreignKey: 'PartyId' });

db.BranchesModel.hasMany(db.TransactionsModel, { foreignKey: 'BranchId' });
db.TransactionsModel.belongsTo(db.BranchesModel, { foreignKey: 'BranchId' });

db.AccountsModel.hasMany(db.TransactionsModel, { foreignKey: 'AccountId' });
db.TransactionsModel.belongsTo(db.AccountsModel, { foreignKey: 'AccountId' });

db.AccountsModel.hasMany(db.TransactionsModel, { foreignKey: 'TransferToAccountId' });
db.TransactionsModel.belongsTo(db.AccountsModel, { foreignKey: 'TransferToAccountId' });

db.TransactionsModel.hasMany(db.TransactionsModel, { foreignKey: 'ParentTransactionId' });
db.TransactionsModel.belongsTo(db.TransactionsModel, { foreignKey: 'ParentTransactionId' });

db.CategoriesModel.hasMany(db.TransactionsModel, { foreignKey: 'CategoryId' });
db.TransactionsModel.belongsTo(db.CategoriesModel, { foreignKey: 'CategoryId' });

db.SubCategoriesModel.hasMany(db.TransactionsModel, { foreignKey: 'SubCategoryId' });
db.TransactionsModel.belongsTo(db.SubCategoriesModel, { foreignKey: 'SubCategoryId' });

// --------------------------- // 


// --------------------------- // 

db.UserModel.hasMany(db.TopicsModel, { foreignKey: 'UsedBy' });
db.TopicsModel.belongsTo(db.UserModel, { foreignKey: 'UsedBy' });

db.OrgModel.hasMany(db.TopicsModel, { foreignKey: 'OrgId' });
db.TopicsModel.belongsTo(db.OrgModel, { foreignKey: 'OrgId' });

db.BranchesModel.hasMany(db.TopicsModel, { foreignKey: 'BranchId' });
db.TopicsModel.belongsTo(db.BranchesModel, { foreignKey: 'BranchId' });


// --------------------------- // 

db.UserModel.hasMany(db.TasksModel, { foreignKey: 'UsedBy' });
db.TasksModel.belongsTo(db.UserModel, { foreignKey: 'UsedBy' });

db.OrgModel.hasMany(db.TasksModel, { foreignKey: 'OrgId' });
db.TasksModel.belongsTo(db.OrgModel, { foreignKey: 'OrgId' });

db.BranchesModel.hasMany(db.TasksModel, { foreignKey: 'BranchId' });
db.TasksModel.belongsTo(db.BranchesModel, { foreignKey: 'BranchId' });

db.TopicsModel.hasMany(db.TasksModel, { foreignKey: 'TopicId' });
db.TasksModel.belongsTo(db.TopicsModel, { foreignKey: 'TopicId' });


// db.BranchesModel.belongsToMany(db.UserModel, { through: db.BranchOwnerModel, foreignKey: 'Branch_Id', }); // Many to Many  
// db.UserModel.belongsToMany(db.BranchesModel, { through: db.BranchOwnerModel, foreignKey: 'UserType_Id', });

// db.BranchesModel.belongsToMany(db.UserModel, { through: db.BranchUserModel, foreignKey: 'Branch_Id', }); // Many to Many  
// db.UserModel.belongsToMany(db.BranchesModel, { through: db.BranchUserModel, foreignKey: 'UserType_Id', });

module.exports = db;