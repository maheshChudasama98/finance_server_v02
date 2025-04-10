const {sequelize, DataTypes} = require("../../configs/Database.config");

const db = {};

// ------------ || Orgs on Models || ------------ //

db.OrgModel = require("./Org.model")(sequelize, DataTypes);
db.BranchesModel = require("./Branches.model")(sequelize, DataTypes);
db.ModulesModel = require("./Modules.model")(sequelize, DataTypes);
db.RolesModel = require("./Roles.model")(sequelize, DataTypes);
db.PermissionModel = require("./Permission.model")(sequelize, DataTypes);
db.FilesModel = require("./Files.model")(sequelize, DataTypes);
db.EmailsmsModel = require("./Emailsms.content.model")(sequelize, DataTypes);

db.UserModel = require("./Users.model")(sequelize, DataTypes);
db.OrgUsersModel = require("./OrgUsers.model")(sequelize, DataTypes);
db.SettingModel = require("./Setting.model")(sequelize, DataTypes);

// ------------ || Base on project || ------------ //

// Finances project models here
db.AccountsModel = require("./Accounts.model")(sequelize, DataTypes);
db.CategoriesModel = require("./Categories.model")(sequelize, DataTypes);
db.SubCategoriesModel = require("./SubCategories.model")(sequelize, DataTypes);
db.LabelsModel = require("./Labels.model")(sequelize, DataTypes);
db.PartiesModel = require("./Parties.model")(sequelize, DataTypes);
db.TransactionsModel = require("./Transactions.model")(sequelize, DataTypes);

// Kanban project models here
db.TopicsModel = require("./Topics.model")(sequelize, DataTypes);
db.TasksModel = require("./Tasks.model")(sequelize, DataTypes);
db.DailyLogsModel = require("./DailyLogs.model")(sequelize, DataTypes);

// ------------ || Orgs base Joins  || ------------ //

//  Branches Model
db.OrgModel.hasMany(db.BranchesModel, {foreignKey: "OrgId"}); // One to Many;
db.BranchesModel.belongsTo(db.OrgModel, {foreignKey: "OrgId"});

// Modules Model
db.OrgModel.hasMany(db.ModulesModel, {foreignKey: "OrgId"}); // One to Many;
db.ModulesModel.belongsTo(db.OrgModel, {foreignKey: "OrgId"});

db.BranchesModel.hasMany(db.ModulesModel, {foreignKey: "BranchId"}); // One to Many;
db.ModulesModel.belongsTo(db.BranchesModel, {foreignKey: "BranchId"});

db.ModulesModel.hasMany(db.ModulesModel, {foreignKey: "ParentNoteId"}); // Self Join;
db.ModulesModel.belongsTo(db.ModulesModel, {foreignKey: "ParentNoteId"});

// Roles Model
db.OrgModel.hasMany(db.RolesModel, {foreignKey: "OrgId"}); // One to Many;
db.RolesModel.belongsTo(db.OrgModel, {foreignKey: "OrgId"});

db.BranchesModel.hasMany(db.RolesModel, {foreignKey: "BranchId"}); // One to Many;
db.RolesModel.belongsTo(db.BranchesModel, {foreignKey: "BranchId"});

db.RolesModel.hasMany(db.RolesModel, {foreignKey: "ParentNoteId"}); // Self Join;
db.RolesModel.belongsTo(db.RolesModel, {foreignKey: "ParentNoteId"});

// Permission Model
db.ModulesModel.hasMany(db.PermissionModel, {foreignKey: "ModuleId"}); // One to Many;
db.PermissionModel.belongsTo(db.ModulesModel, {foreignKey: "ModuleId"});

db.RolesModel.hasMany(db.PermissionModel, {foreignKey: "RoleId"}); // One to Many;
db.PermissionModel.belongsTo(db.RolesModel, {foreignKey: "RoleId"});

// Emailsms Model
db.OrgModel.hasMany(db.EmailsmsModel, {foreignKey: "OrgId"}); // One to Many;
db.EmailsmsModel.belongsTo(db.OrgModel, {foreignKey: "OrgId"});

db.BranchesModel.hasMany(db.EmailsmsModel, {foreignKey: "BranchId"}); // One to Many;
db.EmailsmsModel.belongsTo(db.BranchesModel, {foreignKey: "BranchId"});

db.UserModel.hasMany(db.EmailsmsModel, {foreignKey: "CreateBy"}); // One to Many;
db.EmailsmsModel.belongsTo(db.UserModel, {foreignKey: "CreateBy"});

// Orgs-Users Model
db.OrgModel.hasMany(db.OrgUsersModel, {foreignKey: "OrgId"}); // One to Many;
db.OrgUsersModel.belongsTo(db.OrgModel, {foreignKey: "OrgId"});

db.BranchesModel.hasMany(db.OrgUsersModel, {foreignKey: "BranchId"}); // One to Many;
db.OrgUsersModel.belongsTo(db.BranchesModel, {foreignKey: "BranchId"});

db.RolesModel.hasMany(db.OrgUsersModel, {foreignKey: "RoleId"}); // One to Many;
db.OrgUsersModel.belongsTo(db.RolesModel, {foreignKey: "RoleId"});

db.UserModel.hasMany(db.OrgUsersModel, {foreignKey: "UserId"}); // One to Many;
db.OrgUsersModel.belongsTo(db.UserModel, {foreignKey: "UserId"});

// Setting Model
db.UserModel.hasOne(db.SettingModel, {foreignKey: "UsedBy"}); // One to One;
db.SettingModel.belongsTo(db.UserModel, {foreignKey: "UsedBy"});



// ------------ || Finances on project  || ------------ //

// Accounts Model
db.OrgModel.hasMany(db.AccountsModel, {foreignKey: "OrgId"}); // One to Many;
db.AccountsModel.belongsTo(db.OrgModel, {foreignKey: "OrgId"});

db.BranchesModel.hasMany(db.AccountsModel, {foreignKey: "BranchId"}); // One to Many;
db.AccountsModel.belongsTo(db.BranchesModel, {foreignKey: "BranchId"});

db.UserModel.hasMany(db.AccountsModel, {foreignKey: "UsedBy"}); // One to Many;
db.AccountsModel.belongsTo(db.UserModel, {foreignKey: "UsedBy"});

// Categories Model
db.OrgModel.hasMany(db.CategoriesModel, {foreignKey: "OrgId"}); // One to Many;
db.CategoriesModel.belongsTo(db.OrgModel, {foreignKey: "OrgId"});

db.BranchesModel.hasMany(db.CategoriesModel, {foreignKey: "BranchId"}); // One to Many;
db.CategoriesModel.belongsTo(db.BranchesModel, {foreignKey: "BranchId"});

db.UserModel.hasMany(db.CategoriesModel, {foreignKey: "UsedBy"}); // One to Many;
db.CategoriesModel.belongsTo(db.UserModel, {foreignKey: "UsedBy"});

// Sub-Categories Model
db.OrgModel.hasMany(db.SubCategoriesModel, {foreignKey: "OrgId"}); // One to Many;
db.SubCategoriesModel.belongsTo(db.OrgModel, {foreignKey: "OrgId"});

db.BranchesModel.hasMany(db.SubCategoriesModel, {foreignKey: "BranchId"}); // One to Many;
db.SubCategoriesModel.belongsTo(db.BranchesModel, {foreignKey: "BranchId"});

db.UserModel.hasMany(db.SubCategoriesModel, {foreignKey: "UsedBy"}); // One to Many;
db.SubCategoriesModel.belongsTo(db.UserModel, {foreignKey: "UsedBy"});

db.CategoriesModel.hasMany(db.SubCategoriesModel, {foreignKey: "CategoryId"}); // One to Many;
db.SubCategoriesModel.belongsTo(db.CategoriesModel, {foreignKey: "CategoryId"});

// Labels Model
db.OrgModel.hasMany(db.LabelsModel, {foreignKey: "OrgId"}); // One to Many;
db.LabelsModel.belongsTo(db.OrgModel, {foreignKey: "OrgId"});

db.BranchesModel.hasMany(db.LabelsModel, {foreignKey: "BranchId"}); // One to Many;
db.LabelsModel.belongsTo(db.BranchesModel, {foreignKey: "BranchId"});

db.UserModel.hasMany(db.LabelsModel, {foreignKey: "UsedBy"}); // One to Many;
db.LabelsModel.belongsTo(db.UserModel, {foreignKey: "UsedBy"});

// Parties Model
db.OrgModel.hasMany(db.PartiesModel, {foreignKey: "OrgId"}); // One to Many;
db.PartiesModel.belongsTo(db.OrgModel, {foreignKey: "OrgId"});

db.BranchesModel.hasMany(db.PartiesModel, {foreignKey: "BranchId"}); // One to Many;
db.PartiesModel.belongsTo(db.BranchesModel, {foreignKey: "BranchId"});

db.UserModel.hasMany(db.PartiesModel, {foreignKey: "UsedBy"}); // One to Many;
db.PartiesModel.belongsTo(db.UserModel, {foreignKey: "UsedBy"});

// TransactionsModel
db.OrgModel.hasMany(db.TransactionsModel, {foreignKey: "OrgId"}); // One to Many;
db.TransactionsModel.belongsTo(db.OrgModel, {foreignKey: "OrgId"});

db.BranchesModel.hasMany(db.TransactionsModel, {foreignKey: "BranchId"}); // One to Many;
db.TransactionsModel.belongsTo(db.BranchesModel, {foreignKey: "BranchId"});

db.UserModel.hasMany(db.TransactionsModel, {foreignKey: "UsedBy"}); // One to Many;
db.TransactionsModel.belongsTo(db.UserModel, {foreignKey: "UsedBy"});

db.AccountsModel.hasMany(db.TransactionsModel, {foreignKey: "AccountId"}); // One to Many;
db.TransactionsModel.belongsTo(db.AccountsModel, {foreignKey: "AccountId"});

db.PartiesModel.hasMany(db.TransactionsModel, {foreignKey: "PartyId"}); // One to Many;
db.TransactionsModel.belongsTo(db.PartiesModel, {foreignKey: "PartyId"});

db.AccountsModel.hasMany(db.TransactionsModel, {foreignKey: "TransferToAccountId"}); // One to Many;
db.TransactionsModel.belongsTo(db.AccountsModel, {foreignKey: "TransferToAccountId"});

db.TransactionsModel.hasMany(db.TransactionsModel, {foreignKey: "ParentTransactionId"}); // One to Many;
db.TransactionsModel.belongsTo(db.TransactionsModel, {foreignKey: "ParentTransactionId"});

db.CategoriesModel.hasMany(db.TransactionsModel, {foreignKey: "CategoryId"}); // One to Many;
db.TransactionsModel.belongsTo(db.CategoriesModel, {foreignKey: "CategoryId"});

db.SubCategoriesModel.hasMany(db.TransactionsModel, {foreignKey: "SubCategoryId"}); // One to Many;
db.TransactionsModel.belongsTo(db.SubCategoriesModel, {foreignKey: "SubCategoryId"});

// ------------ || Kanban on project  Join || ------------ //

// Topics Model
db.OrgModel.hasMany(db.TopicsModel, {foreignKey: "OrgId"}); // One to Many;
db.TopicsModel.belongsTo(db.OrgModel, {foreignKey: "OrgId"});

db.BranchesModel.hasMany(db.TopicsModel, {foreignKey: "BranchId"}); // One to Many;
db.TopicsModel.belongsTo(db.BranchesModel, {foreignKey: "BranchId"});

db.UserModel.hasMany(db.TopicsModel, {foreignKey: "UsedBy"}); // One to Many;
db.TopicsModel.belongsTo(db.UserModel, {foreignKey: "UsedBy"});

// Tasks Model
db.OrgModel.hasMany(db.TasksModel, {foreignKey: "OrgId"}); // One to Many;
db.TasksModel.belongsTo(db.OrgModel, {foreignKey: "OrgId"});

db.BranchesModel.hasMany(db.TasksModel, {foreignKey: "BranchId"}); // One to Many;
db.TasksModel.belongsTo(db.BranchesModel, {foreignKey: "BranchId"});

db.UserModel.hasMany(db.TasksModel, {foreignKey: "UsedBy"}); // One to Many;
db.TasksModel.belongsTo(db.UserModel, {foreignKey: "UsedBy"});

db.TopicsModel.hasMany(db.TasksModel, {foreignKey: "TopicId"}); // One to Many;
db.TasksModel.belongsTo(db.TopicsModel, {foreignKey: "TopicId"});

// DailyLogs Model
db.UserModel.hasMany(db.DailyLogsModel, {foreignKey: "UserId"}); // One to Many;
db.DailyLogsModel.belongsTo(db.UserModel, {foreignKey: "UserId"});

// db.BranchesModel.belongsToMany(db.UserModel, { through: db.BranchOwnerModel, foreignKey: 'Branch_Id', }); // Many to Many
// db.UserModel.belongsToMany(db.BranchesModel, { through: db.BranchOwnerModel, foreignKey: 'UserType_Id', });

// db.BranchesModel.belongsToMany(db.UserModel, { through: db.BranchUserModel, foreignKey: 'Branch_Id', }); // Many to Many
// db.UserModel.belongsToMany(db.BranchesModel, { through: db.BranchUserModel, foreignKey: 'UserType_Id', });

module.exports = db;
