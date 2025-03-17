require('dotenv').config();

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require("../models/index");
const { Op } = require('sequelize');
const { defaultCategoryList } = require('../constants/defaultData');

const OrgModel = db.OrgModel;
const RolesModel = db.RolesModel;
const ModulesModel = db.ModulesModel;
const BranchesModel = db.BranchesModel;
const PermissionModel = db.PermissionModel;
const UserTypesModel = db.UserTypesModel;
const UserModel = db.UserModel;
const OrgUsersModel = db.OrgUsersModel;
const CategoriesModel = db.CategoriesModel;
const SubCategoriesModel = db.SubCategoriesModel;

const roleList = [
    { RoleName: "User Admin", Description: "All Right have" },
    { RoleName: "Admin", Description: "Admin" },
    { RoleName: "User", Description: "User" },
    { RoleName: "Manager", Description: "Manager" },
];

const modulesList = [
    { ModulesName: "Records", Description: "Records", },
    { ModulesName: "Accounts", Description: "Accounts" },
    { ModulesName: "Counter Party", Description: "Counter Party" },
    { ModulesName: "Templates", Description: "Templates" },
    { ModulesName: "Categories", Description: "Categories" },
    { ModulesName: "Labels", Description: "Labels" },
    { ModulesName: "General Setting", Description: "General Setting" },
    { ModulesName: "Setting", Description: "Setting" },
];

exports.UserBasedDefaultCategory = async (UserId, OrgId, BranchId) => {

    try {

        for (let index = 0; index < defaultCategoryList.length; index++) {
            const element = defaultCategoryList[index];

            const created = await CategoriesModel?.create({
                ...element,
                UsedBy: UserId,
                OrgId: OrgId,
                BranchId: BranchId
            });

            for (let i = 0; i < element?.Child.length; i++) {
                const sub = element?.Child[i];
                console.log(sub, "sub");
                await SubCategoriesModel?.create({
                    ...sub,
                    CategoryId: created?.CategoryId,
                    UsedBy: UserId,
                    OrgId: OrgId,
                    BranchId: BranchId
                });
            }

        }
    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
    };
};


exports.PrimeDatabaseAction = async () => {
    const userTypeData = [
        { userTypeId: 1, typeName: "SuperAdmin" },
        { userTypeId: 2, typeName: "Admin" },
        { userTypeId: 3, typeName: "User" }]

    userTypeData.map(async (item) => {
        await UserTypesModel.findOne({ where: { typeName: item.typeName }, raw: true }).then(async (res) => {
            if (res === null) {
                await UserTypesModel.create(item).then((resRole) => { }).catch((error) => {
                    console.log(`\x1b[91m ${error} \x1b[91m`)
                })
            } else {

            }
        })
    })
};

exports.SuperAdminDatabaseAction = async () => {
};

exports.DefaultDatabaseAction = async () => {

    let defaultOrg = await OrgModel.findOne({
        where: {
            OrgName: process.env.DEFAULT_ORG,
            isDeleted: false,
            isActive: true
        },
        raw: true
    });

    if (!defaultOrg?.OrgId) {
        const uuid = uuidv4();

        defaultOrg = await OrgModel.create({
            OrgName: process.env.DEFAULT_ORG,
            Description: process.env.DEFAULT_ORG,
            UUID: uuid,
            isDeleted: false,
            isActive: true
        });
    };

    let defaultBranch = await BranchesModel.findOne({
        where: {
            BranchName: "Main Branch",
            OrgId: defaultOrg?.OrgId,
            isDeleted: false,
            isActive: true
        },
        raw: true
    });

    if (!defaultBranch?.BranchId) {
        const uuid = uuidv4();
        defaultBranch = await BranchesModel.create({
            BranchName: "Main Branch",
            Description: "Main Branch",
            OrgId: defaultOrg?.OrgId,
            UUID: uuid,
            isDeleted: false,
            isActive: true
        });
    };

    for (let index = 0; index < modulesList.length; index++) {

        const element = modulesList[index];

        const findModules = await ModulesModel.findOne({
            where: {
                ModulesName: element?.ModulesName,
                OrgId: defaultOrg?.OrgId,
                BranchId: defaultBranch?.BranchId,
            },
            raw: true
        });

        if (!findModules?.ModulesId) {
            await ModulesModel.create({
                ModulesName: element?.ModulesName,
                Description: element?.Description,
                OrgId: defaultOrg?.OrgId,
                BranchId: defaultBranch?.BranchId,
                Router: "Router",
                isDeleted: false,
                isActive: true
            });
        };

    };

    for (let index = 0; index < roleList.length; index++) {

        const element = roleList[index];

        const findRole = await RolesModel.findOne({
            where: {
                RoleName: element?.RoleName,
                OrgId: defaultOrg?.OrgId,
                BranchId: defaultBranch?.BranchId,
            },
            raw: true
        });

        if (!findRole?.RoleId) {

            const roleCreated = await RolesModel.create({
                RoleName: element?.RoleName,
                Description: element?.Description,
                OrgId: defaultOrg?.OrgId,
                BranchId: defaultBranch?.BranchId,
                isDeleted: false,
                isActive: true
            });

            const listModules = await ModulesModel.findAll({
                where: {
                    OrgId: defaultOrg?.OrgId,
                }, raw: true
            });

            for (let index = 0; index < listModules.length; index++) {

                const element = listModules[index];

                await PermissionModel.create({
                    RoleId: roleCreated?.RoleId,
                    ModuleId: element?.ModulesId,
                    CanRead: true,
                    CanWrite: true
                });
            };

        };
    };

    const adminUser = {
        UUID: uuidv4(),
        FirstName: "Super",
        LastName: "Admin",
        AvatarName: "SA",
        Email: "superadmin@gmail.com",
        Mobile: "1234567890",
        Password: bcrypt.hashSync("Admin@123", 10),
        Language: "EN",
        isDeleted: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const findUser = await UserModel.findOne({
        where: {
            [Op.or]: [
                { Email: adminUser?.Email || "" },
                { Mobile: adminUser?.Mobile || "" }
            ],
            isDeleted: false
        },
        raw: true
    });


    if (!findUser?.UserId) {

        let createdUser = await UserModel.create(adminUser);

        for (let index = 0; index < defaultCategoryList.length; index++) {
            const element = defaultCategoryList[index];

            const created = await CategoriesModel?.create({
                ...element,
                UsedBy: createdUser?.UserId,
                OrgId: defaultOrg?.OrgId,
                BranchId: defaultBranch?.BranchId
            });

            for (let i = 0; i < element?.Child.length; i++) {

                const sub = element?.Child[i];

                await SubCategoriesModel?.create({
                    ...sub,
                    CategoryId: created?.CategoryId,
                    UsedBy: createdUser?.UserId,
                    OrgId: defaultOrg?.OrgId,
                    BranchId: defaultBranch?.BranchId
                });
            }

        }

        await OrgUsersModel.create({
            OrgId: defaultOrg?.OrgId,
            BranchId: defaultBranch?.BranchId,
            UserId: createdUser?.UserId,
            RoleId: 1,
            DefaultOrg: true,
            isDeleted: false,
            isActive: true,
        }).then(() => { }).catch((error) => {
            console.log(`\x1b[91m ${error} \x1b[91m`)
        });
    };
};

// --------- ||  || --------- //

exports.ModulesSetAction = async (OrgId) => {

    for (let index = 0; index < modulesList.length; index++) {

        const element = modulesList[index];

        const findModules = await ModulesModel.findOne({
            where: {
                ModulesName: element?.ModulesName,
                OrgId: OrgId,
            },
            raw: true
        });

        if (!findModules?.ModulesId) {
            await ModulesModel.create({
                ModulesName: element?.ModulesName,
                Description: element?.Description,
                OrgId: OrgId,
                isDeleted: false,
                isActive: true
            });
        };

    };

    for (let index = 0; index < roleList.length; index++) {

        const element = roleList[index];

        const findRole = await RolesModel.findOne({
            where: {
                RoleName: element?.RoleName,
                OrgId: OrgId,
            },
            raw: true
        });

        if (!findRole?.RoleId) {

            const roleCreated = await RolesModel.create({
                RoleName: element?.RoleName,
                Description: element?.Description,
                OrgId: OrgId,
                isDeleted: false,
                isActive: true
            });

            const listModules = await ModulesModel.findAll({
                where: {
                    OrgId: OrgId,
                }, raw: true
            });

            for (let index = 0; index < listModules.length; index++) {

                const element = listModules[index];

                await PermissionModel.create({
                    RoleId: roleCreated?.RoleId,
                    ModuleId: element?.ModulesId,
                    CanRead: true,
                    CanWrite: true
                });
            };

        };
    };
};

exports.RolesSetAction = async () => {

    let defaultOrg = await OrgModel.findOne({
        where: {
            OrgName: process.env.DEFAULT_ORG,
            isDeleted: false,
            isActive: true
        },
        raw: true
    });



    if (!defaultOrg?.OrgId) {
        const uuid = uuidv4();

        defaultOrg = await OrgModel.create({
            OrgName: process.env.DEFAULT_ORG,
            Description: process.env.DEFAULT_ORG,
            UUID: uuid,
            isDeleted: false,
            isActive: true
        });
    };

    let defaultBranch = await BranchesModel.findOne({
        where: {
            BranchName: "Main Branch",
            OrgId: defaultOrg?.OrgId,
            isDeleted: false,
            isActive: true
        },
        raw: true
    });

    if (!defaultBranch?.BranchId) {
        const uuid = uuidv4();
        await BranchesModel.create({
            BranchName: "Main Branch",
            Description: "Main Branch",
            OrgId: defaultOrg?.OrgId,
            UUID: uuid,
            isDeleted: false,
            isActive: true
        });
    };

    for (let index = 0; index < modulesList.length; index++) {

        const element = modulesList[index];

        const findModules = await ModulesModel.findOne({
            where: {
                ModulesName: element?.ModulesName,
                OrgId: defaultOrg?.OrgId,
            },
            raw: true
        });

        if (!findModules?.ModulesId) {
            await ModulesModel.create({
                ModulesName: element?.ModulesName,
                Description: element?.Description,
                OrgId: defaultOrg?.OrgId,
                isDeleted: false,
                isActive: true
            });
        };

    };

    for (let index = 0; index < roleList.length; index++) {

        const element = roleList[index];

        const findRole = await RolesModel.findOne({
            where: {
                RoleName: element?.RoleName,
                OrgId: defaultOrg?.OrgId,
            },
            raw: true
        });

        if (!findRole?.RoleId) {

            const roleCreated = await RolesModel.create({
                RoleName: element?.RoleName,
                Description: element?.Description,
                OrgId: defaultOrg?.OrgId,
                isDeleted: false,
                isActive: true
            });

            const listModules = await ModulesModel.findAll({
                where: {
                    OrgId: defaultOrg?.OrgId,
                }, raw: true
            });

            for (let index = 0; index < listModules.length; index++) {

                const element = listModules[index];

                await PermissionModel.create({
                    RoleId: roleCreated?.RoleId,
                    ModuleId: element?.ModulesId,
                    CanRead: true,
                    CanWrite: true
                });
            };

        };
    };
};



// --------- || Set Default Roles on Branch  || --------- //





// --------- || Set Default Modules base on Branch  || --------- //

// --------- || Set Default Category base on User and Branch  || --------- //
