const { SUCCESS_CODE, BAD_REQUEST_CODE, SERVER_ERROR_CODE } = require("../constants/statusCode");
const { getPagination } = require("../../helpers/Actions.helper");
const { v4: uuidv4 } = require('uuid');

const db = require("../models/index");
const { Op, Sequelize } = require("sequelize");
const OrgModel = db.OrgModel;
const ModulesModel = db.ModulesModel;
const BranchesModel = db.BranchesModel;

const UserModel = db.UserModel;
const OrgUsersModel = db.OrgUsersModel;
const PermissionModel = db.PermissionModel;

// ------------------------ || Org Controllers || ------------------------ //

exports.OrgModifyController = async (payloadUser, payloadBody) => {
    try {
        const { OrgId, OrgName, Description } = payloadBody;

        const orgTarget = await OrgModel.findOne({
            where: { OrgName: OrgName },
            raw: true
        });

        if (!OrgId) {

            if (orgTarget?.OrgId) {
                return ({
                    httpCode: SUCCESS_CODE,
                    result: { status: false, message: "DUPLICATE" }
                });
            } else {

                const uuid = uuidv4();

                await OrgModel.create({
                    OrgName: OrgName?.trim() || null,
                    Description: Description,
                    UUID: uuid,
                    isDeleted: false,
                    isActive: true
                });

                return ({
                    httpCode: SUCCESS_CODE,
                    result: { status: true, message: "SUCCESS" }
                });
            };

        } else {

            if (orgTarget?.OrgId && orgTarget?.OrgId != OrgId) {

                return ({
                    httpCode: SUCCESS_CODE,
                    result: { status: false, message: "DUPLICATE" }
                });

            } else {

                await OrgModel.update({
                    OrgName: OrgName?.trim() || null,
                    Description: Description,
                }, { where: { OrgId: OrgId } });

                return ({
                    httpCode: SUCCESS_CODE,
                    result: { status: true, message: "SUCCESS" }
                });

            };
        };

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: { status: false, message: error.message }
        });
    };

};

exports.OrgListController = async (payloadUser, payloadBody) => {
    try {
        const { Action, Page, PageSize, FilterBy } = payloadBody;

        if (Action) {

            if (!Page || !PageSize) {
                return ({
                    httpCode: BAD_REQUEST_CODE,
                    result: {
                        status: false,
                        message: "BAD_REQUEST_CODE",
                    }
                });
            };
            var { limit, offset } = getPagination(Page, PageSize);
        };

        const whereCondition = { isDeleted: false };

        if (FilterBy?.OrgName) {
            whereCondition.OrgName = { [Op.like]: "%" + FilterBy?.OrgName + "%", };
        };

        if (FilterBy?.IsActive == true || FilterBy?.IsActive == false) {
            whereCondition.isActive = { [Op.eq]: FilterBy?.IsActive, };
        };

        const OrgList = await OrgModel.findAll({
            attributes: [
                "OrgId",
                "OrgName",
                "Description",
                "ImgPath",
                "isActive",
                "createdAt",
                [
                    Sequelize.literal(`( SELECT COUNT(*) FROM branches WHERE branches.OrgId = orgs.OrgId  AND branches.isDeleted = false)`), 'TotalBranches'
                ],
                [
                    Sequelize.literal(`( SELECT COUNT(*) FROM orgusers WHERE orgusers.OrgId = orgs.OrgId  AND orgusers.isDeleted = false)`), 'TotalUser'
                ],
                [
                    Sequelize.literal(`(
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'OrgId', branches.OrgId,
                                'BranchId', branches.BranchId,
                                'BranchName', branches.BranchName,
                                'Description', branches.Description,
                                'Address', branches.Address,
                                'City', branches.City,
                                'GstNumber', branches.GstNumber,
                                'Phone', branches.Phone,
                                'Email', branches.Email,
                                'ImgPath', branches.ImgPath,
                                'createdAt', branches.createdAt,
                                'BranchUser', (SELECT COUNT(orgusers.BranchId)  FROM orgusers  WHERE orgusers.BranchId = branches.BranchId  AND orgusers.isDeleted = false)
                            )
                        )
                        FROM branches  
                        WHERE branches.OrgId = orgs.OrgId 
                        AND branches.isDeleted = false
                    )`),
                    "BranchesList"
                ],
            ],

            where: whereCondition,
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],
            raw: true,
        });

        if (Action) {

            const totalCount = await OrgModel.count({
                where: whereCondition,
                distinct: true,
                subQuery: false,
            });

            let totalPage = Math.ceil(totalCount / limit);

            return ({
                httpCode: SUCCESS_CODE,
                result: {
                    status: true,
                    message: "SUCCESS",
                    data: {
                        list: OrgList,
                        totalRecords: totalCount,
                        totalPages: totalPage,
                        currentPage: parseInt(Page)
                    }
                }
            });

        } else {

            return ({
                httpCode: SUCCESS_CODE,
                result: {
                    status: true,
                    message: "SUCCESS",
                    data: { list: OrgList }
                }
            });

        };

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};

exports.OrgRemoveController = async (payloadUser, payloadQuery) => {
    try {

        const { OrgId } = payloadQuery;

        await OrgModel.update({
            isDeleted: true
        }, {
            where: { OrgId: OrgId }
        });

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
            }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};

exports.OrgActiveController = async (payloadUser, payloadQuery) => {
    try {
        const { OrgId } = payloadQuery;

        const orgFind = await OrgModel.findOne({
            attributes: ["isActive"],
            where: { OrgId: OrgId },
            raw: true
        });

        await OrgModel.update({ isActive: !orgFind?.isActive }, { where: { OrgId: OrgId } });

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
            }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};

// ------------------------ || Branches Controllers || ------------------------ //

exports.BranchModifyController = async (payloadUser, payloadBody) => {
    try {
        const { BranchId, BranchName, Description } = payloadBody;

        const target = await BranchesModel.findOne({
            where: {
                BranchName: BranchName,
                OrgId: payloadUser?.OrgId,
                isDeleted: false
            },
            raw: true
        });

        if (!BranchId) {

            if (target?.BranchId) {
                return ({
                    httpCode: SUCCESS_CODE,
                    result: {
                        status: false,
                        message: "DUPLICATE",
                    }
                });
            } else {

                const uuid = uuidv4();

                await BranchesModel.create({
                    BranchName: BranchName?.trim() || null,
                    Description: Description,
                    OrgId: payloadUser?.OrgId,
                    UUID: uuid,
                    isDeleted: false,
                    isActive: true
                });

                return ({
                    httpCode: SUCCESS_CODE,
                    result: {
                        status: true,
                        message: "SUCCESS",
                    }
                });
            };

        } else {

            if (target?.BranchId && target?.BranchId != BranchId) {

                return ({
                    httpCode: SUCCESS_CODE,
                    result: {
                        status: false,
                        message: "DUPLICATE",
                    }
                });

            } else {

                await BranchesModel.update({
                    BranchName: BranchName?.trim() || null,
                    Description: Description,
                }, { where: { BranchId: BranchId } });

                return ({
                    httpCode: SUCCESS_CODE,
                    result: {
                        status: true,
                        message: "SUCCESS",
                    }
                });

            };
        };

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};

exports.BranchListController = async (payloadUser, payloadBody) => {
    try {
        const { Action, Page, PageSize, FilterBy } = payloadBody;

        if (Action) {

            if (!Page || !PageSize) {
                return ({
                    httpCode: BAD_REQUEST_CODE,
                    result: {
                        status: false,
                        message: "BAD_REQUEST_CODE",
                    }
                });
            };
            var { limit, offset } = getPagination(Page, PageSize);
        };

        const whereCondition = { isDeleted: false };

        if (FilterBy?.BranchName) {
            whereCondition.BranchName = { [Op.like]: "%" + FilterBy?.BranchName + "%", };
        };

        if (FilterBy?.IsActive == true || FilterBy?.IsActive == false) {
            whereCondition.isActive = { [Op.eq]: FilterBy?.IsActive, };
        };

        if (FilterBy?.Orgs && FilterBy?.Orgs?.length > 0) {
            whereCondition.OrgId = { [Op.in]: FilterBy?.Orgs };
        };

        const branchesList = await BranchesModel.findAll({
            attributes: [
                "BranchId",
                "BranchName",
                "Description",
                "Address",
                "City",
                "State",
                "GstNumber",
                "Phone",
                "Email",
                "ImgPath",
                "isActive",
                "createdAt",
                "updatedAt",
                [Sequelize.col("org.OrgName"), 'OrgName'],
                [Sequelize.literal(`(SELECT COUNT(orgusers.BranchId)  FROM orgusers  WHERE orgusers.BranchId = branches.BranchId  AND orgusers.isDeleted = false)`), 'TotalUser'],
                [Sequelize.literal(`(
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'UserId', users.UserId,
                            'FullName', CONCAT(users.FirstName, ' ', users.LastName),
                            'FirstName', users.FirstName,
                            'LastName', users.LastName,
                            'AvatarName', users.AvatarName,
                            'ImgPath', users.ImgPath,
                            'Email', users.Email
                        )
                    )
                    FROM orgusers JOIN users ON users.UserId = orgusers.UserId WHERE orgusers.BranchId = branches.BranchId  AND orgusers.isDeleted = false
                )`), 'UserList'],
            ],
            include: [{
                model: OrgModel,
                attributes: []
            }],
            where: whereCondition,
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],
            raw: true,
        });

        if (Action) {
            const totalCount = await BranchesModel.count({
                where: whereCondition,
                distinct: true,
                subQuery: false,
            });

            let totalPage = Math.ceil(totalCount / limit);

            return ({
                httpCode: SUCCESS_CODE,
                result: {
                    status: true,
                    message: "SUCCESS",
                    data: {
                        list: branchesList,
                        totalRecords: totalCount,
                        totalPages: totalPage,
                        currentPage: parseInt(Page)
                    }
                }
            });

        } else {

            return ({
                httpCode: SUCCESS_CODE,
                result: {
                    status: true,
                    message: "SUCCESS",
                    data: { list: branchesList }
                }
            });

        };

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};

exports.BranchRemoveController = async (payloadUser, payloadQuery) => {
    try {

        const { BranchId } = payloadQuery;

        await BranchesModel.update({
            isDeleted: true
        }, {
            where: { BranchId: BranchId }
        });

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
            }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};

exports.BranchActiveController = async (payloadUser, payloadQuery) => {
    try {
        const { BranchId } = payloadQuery;

        const target = await BranchesModel.findOne({
            attributes: ["isActive"],
            where: { BranchId: BranchId },
            raw: true
        });

        await BranchesModel.update({ isActive: !target?.isActive }, { where: { BranchId: BranchId } });

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
            }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};

// ------------------------ || Modules Controllers || ------------------------ //

exports.ModuleModifyController = async (payloadUser, payloadBody) => {
    try {
        const { ModulesId, ModulesName, Description } = payloadBody;

        const target = await BranchesModel.findOne({
            where: {
                ModulesName: ModulesName,
                OrgId: payloadUser?.OrgId,
                isDeleted: false
            },
            raw: true
        });

        if (!ModulesId) {

            if (target?.ModulesId) {
                return ({
                    httpCode: SUCCESS_CODE,
                    result: {
                        status: false,
                        message: "DUPLICATE",
                    }
                });
            } else {

                const uuid = uuidv4();

                await BranchesModel.create({
                    ModulesName: ModulesName?.trim() || null,
                    Description: Description,
                    OrgId: payloadUser?.OrgId,
                    UUID: uuid,
                    isDeleted: false,
                    isActive: true
                });

                return ({
                    httpCode: SUCCESS_CODE,
                    result: {
                        status: true,
                        message: "SUCCESS",
                    }
                });
            };

        } else {

            if (target?.ModulesId && target?.ModulesId != ModulesId) {

                return ({
                    httpCode: SUCCESS_CODE,
                    result: {
                        status: false,
                        message: "DUPLICATE",
                    }
                });

            } else {

                await BranchesModel.update({
                    ModulesName: ModulesName?.trim() || null,
                    Description: Description,
                }, { where: { ModulesId: ModulesId } });

                return ({
                    httpCode: SUCCESS_CODE,
                    result: {
                        status: true,
                        message: "SUCCESS",
                    }
                });

            };
        };

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};

exports.ModuleListController = async (payloadUser, payloadBody) => {
    try {
        const { Action, Page, PageSize, FilterBy } = payloadBody;

        if (Action) {

            if (!Page || !PageSize) {
                return ({
                    httpCode: BAD_REQUEST_CODE,
                    result: {
                        status: false,
                        message: "BAD_REQUEST_CODE",
                    }
                });
            };
            var { limit, offset } = getPagination(Page, PageSize);
        };

        const whereCondition = {
            isDeleted: false,
            OrgId: payloadUser?.OrgId
        };

        if (FilterBy?.ModulesName) {
            whereCondition.ModulesName = { [Op.like]: "%" + FilterBy?.ModulesName + "%", };
        };

        if (FilterBy?.IsActive == true || FilterBy?.IsActive == false) {
            whereCondition.isActive = { [Op.eq]: FilterBy?.IsActive, };
        };

        const branchesList = await ModulesModel.findAll({
            attributes: ["ModulesId", "ModulesName", "Description", "isDeleted", "isActive", "createdAt", "updatedAt"],
            where: whereCondition,
            limit: limit,
            offset: offset,
            order: [['ModulesName', 'ASC']],
            raw: true,
        });

        if (Action) {
            const totalCount = await ModulesModel.count({
                where: whereCondition,
                distinct: true,
                subQuery: false,
            });

            let totalPage = Math.ceil(totalCount / limit);

            return ({
                httpCode: SUCCESS_CODE,
                result: {
                    status: true,
                    message: "SUCCESS",
                    data: {
                        list: branchesList,
                        totalRecords: totalCount,
                        totalPages: totalPage,
                        currentPage: parseInt(Page)
                    }
                }
            });

        } else {

            return ({
                httpCode: SUCCESS_CODE,
                result: {
                    status: true,
                    message: "SUCCESS",
                    data: { list: branchesList }
                }
            });

        };

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};

exports.ModuleRemoveController = async (payloadUser, payloadQuery) => {
    try {

        const { ModulesId } = payloadQuery;

        await ModulesModel.update({
            isDeleted: true
        }, {
            where: { ModulesId: ModulesId }
        });

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
            }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};

exports.ModuleActiveController = async (payloadUser, payloadQuery) => {
    try {
        const { ModulesId } = payloadQuery;

        const target = await ModulesModel.findOne({
            attributes: ["isActive"],
            where: { ModulesId: ModulesId },
            raw: true
        });

        await ModulesModel.update({ isActive: !target?.isActive }, { where: { ModulesId: ModulesId } });

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
            }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};

// ------------------------ || Roles Controllers || ------------------------ //

exports.RoleModifyController = async (payloadUser, payloadBody) => {
    try {
        const { BranchId, BranchName, Description } = payloadBody;

        const target = await BranchesModel.findOne({
            where: {
                BranchName: BranchName,
                OrgId: payloadUser?.OrgId,
                isDeleted: false
            },
            raw: true
        });

        if (!BranchId) {

            if (target?.BranchId) {
                return ({
                    httpCode: SUCCESS_CODE,
                    result: {
                        status: false,
                        message: "DUPLICATE",
                    }
                });
            } else {

                const uuid = uuidv4();

                await BranchesModel.create({
                    BranchName: BranchName?.trim() || null,
                    Description: Description,
                    OrgId: payloadUser?.OrgId,
                    UUID: uuid,
                    isDeleted: false,
                    isActive: true
                });

                return ({
                    httpCode: SUCCESS_CODE,
                    result: {
                        status: true,
                        message: "SUCCESS",
                    }
                });
            };

        } else {

            if (target?.BranchId && target?.BranchId != BranchId) {

                return ({
                    httpCode: SUCCESS_CODE,
                    result: {
                        status: false,
                        message: "DUPLICATE",
                    }
                });

            } else {

                await BranchesModel.update({
                    BranchName: BranchName?.trim() || null,
                    Description: Description,
                }, { where: { BranchId: BranchId } });

                return ({
                    httpCode: SUCCESS_CODE,
                    result: {
                        status: true,
                        message: "SUCCESS",
                    }
                });

            };
        };

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};

exports.RoleListController = async (payloadUser, payloadBody) => {
    try {
        const { Action, Page, PageSize, FilterBy } = payloadBody;

        if (Action) {

            if (!Page || !PageSize) {
                return ({
                    httpCode: BAD_REQUEST_CODE,
                    result: {
                        status: false,
                        message: "BAD_REQUEST_CODE",
                    }
                });
            };
            var { limit, offset } = getPagination(Page, PageSize);
        };

        const whereCondition = { isDeleted: false };

        if (FilterBy?.BranchName) {
            whereCondition.BranchName = { [Op.like]: "%" + FilterBy?.BranchName + "%", };
        };

        if (FilterBy?.IsActive == true || FilterBy?.IsActive == false) {
            whereCondition.isActive = { [Op.eq]: FilterBy?.IsActive, };
        };

        if (FilterBy?.Orgs && FilterBy?.Orgs?.length > 0) {
            whereCondition.OrgId = { [Op.in]: FilterBy?.Orgs };
        };

        const branchesList = await BranchesModel.findAll({
            attributes: [
                "BranchId",
                "BranchName",
                "Description",
                "Address",
                "City",
                "State",
                "GstNumber",
                "Phone",
                "Email",
                "ImgPath",
                "isActive",
                "createdAt",
                "updatedAt",
                [Sequelize.col("org.OrgName"), 'OrgName'],
                [Sequelize.literal(`(SELECT COUNT(orgusers.BranchId)  FROM orgusers  WHERE orgusers.BranchId = branches.BranchId  AND orgusers.isDeleted = false)`), 'TotalUser'],
                [Sequelize.literal(`(
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'UserId', users.UserId,
                            'FullName', CONCAT(users.FirstName, ' ', users.LastName),
                            'FirstName', users.FirstName,
                            'LastName', users.LastName,
                            'AvatarName', users.AvatarName,
                            'ImgPath', users.ImgPath,
                            'Email', users.Email
                        )
                    )
                    FROM orgusers JOIN users ON users.UserId = orgusers.UserId WHERE orgusers.BranchId = branches.BranchId  AND orgusers.isDeleted = false
                )`), 'UserList'],
            ],
            include: [{
                model: OrgModel,
                attributes: []
            }],
            where: whereCondition,
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],
            raw: true,
        });

        if (Action) {
            const totalCount = await BranchesModel.count({
                where: whereCondition,
                distinct: true,
                subQuery: false,
            });

            let totalPage = Math.ceil(totalCount / limit);

            return ({
                httpCode: SUCCESS_CODE,
                result: {
                    status: true,
                    message: "SUCCESS",
                    data: {
                        list: branchesList,
                        totalRecords: totalCount,
                        totalPages: totalPage,
                        currentPage: parseInt(Page)
                    }
                }
            });

        } else {

            return ({
                httpCode: SUCCESS_CODE,
                result: {
                    status: true,
                    message: "SUCCESS",
                    data: { list: branchesList }
                }
            });

        };

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};

exports.RoleRemoveController = async (payloadUser, payloadQuery) => {
    try {

        const { BranchId } = payloadQuery;

        await BranchesModel.update({
            isDeleted: true
        }, {
            where: { BranchId: BranchId }
        });

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
            }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};

exports.RoleActiveController = async (payloadUser, payloadQuery) => {
    try {
        const { BranchId } = payloadQuery;

        const target = await BranchesModel.findOne({
            attributes: ["isActive"],
            where: { BranchId: BranchId },
            raw: true
        });

        await BranchesModel.update({ isActive: !target?.isActive }, { where: { BranchId: BranchId } });

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
            }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: {
                status: false,
                message: error.message
            }
        });
    };

};