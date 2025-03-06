const { Op, Sequelize } = require("sequelize")
const { SuperAdminID, JuniorEngineerID, } = require("../constants/constants");
const { SUCCESS_CODE, SERVER_ERROR_CODE, BAD_REQUEST_CODE } = require("../constants/statusCode");
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const db = require("../models/index");
const UserModel = db.UserModel;
const OrgUsersModel = db.OrgUsersModel;
const ModulesModel = db.ModulesModel;
const PermissionModel = db.PermissionModel;

// ------------ ||  || ------------ //

exports.UserInfoController = async (payloadUser) => {
    try {
        const { UserId } = payloadUser;

        const UserDetails = await OrgUsersModel.findOne({
            attributes: [
                "OrgUserId",
                "OrgId",
                "BranchId",
                "UserId",
                "RoleId",
                "DefaultOrg",
                [
                    Sequelize.literal(`(
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'OrgId', orgs.OrgId,
                                'OrgName', orgs.OrgName,
                                'Description', orgs.Description,
                                'UUID', orgs.UUID,
                                'ImgPath', orgs.ImgPath,
                                'createdAt', orgs.createdAt
                            )
                        )
                        FROM orgs
                        WHERE 
                        orgs.isDeleted = false AND orgs.isActive = true
                        AND orgs.OrgId IN ( SELECT OrgId FROM orgusers WHERE orgusers.UserId = ${UserId} )
                    )`),
                    "OrgsList"
                ],
                [
                    Sequelize.literal(`(
                        SELECT 
                            JSON_OBJECT(
                                'OrgId', orgs.OrgId,
                                'OrgName', orgs.OrgName,
                                'Description', orgs.Description,
                                'UUID', orgs.UUID,
                                'ImgPath', orgs.ImgPath,
                                'createdAt', orgs.createdAt
                        )
                        FROM orgs
                        WHERE  orgs.isDeleted = false AND orgs.isActive = true
                        AND orgs.OrgId = ( 
                            SELECT OrgId 
                            FROM orgusers 
                            WHERE orgusers.UserId = ${UserId} 
                            AND orgusers.DefaultOrg = true 
                            LIMIT 1
                        )
                    )`),
                    "SelectOrg"
                ],
                [
                    Sequelize.literal(`(
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'BranchId', branches.BranchId,
                                'BranchName', branches.BranchName,
                                'Description', branches.Description,
                                'UUID', branches.UUID,
                                'Address', branches.Address,
                                'City', branches.City,
                                'GstNumber', branches.GstNumber,
                                'Phone', branches.Phone,
                                'Email', branches.Email,
                                'ImgPath', branches.ImgPath,
                                'createdAt', branches.createdAt
                            )
                        )
                        FROM branches
                        WHERE branches.BranchId IN (
                                SELECT BranchId 
                                FROM orgusers 
                                WHERE orgusers.UserId = ${UserId} 
                                AND orgusers.OrgId = orgusers.OrgId
                            )
                    )`),
                    "BranchesList"
                ],
                [
                    Sequelize.literal(`(
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'BranchId', branches.BranchId,
                                'BranchName', branches.BranchName,
                                'Description', branches.Description,
                                'UUID', branches.UUID,
                                'Address', branches.Address,
                                'City', branches.City,
                                'GstNumber', branches.GstNumber,
                                'Phone', branches.Phone,
                                'Email', branches.Email,
                                'ImgPath', branches.ImgPath,
                                'createdAt', branches.createdAt
                            )
                        )
                        FROM branches
                        WHERE branches.BranchId = (
                                SELECT BranchId 
                                FROM orgusers 
                                WHERE orgusers.UserId = ${UserId} 
                                AND orgusers.OrgId = orgusers.OrgId
                                AND orgusers.DefaultOrg = true 
                                LIMIT 1
                            )
                    )`),
                    "SelectBranch"
                ],
            ],
            where: {
                UserId: UserId,
                DefaultOrg: true
            },
            raw: true
        });

        const PermissionList = await PermissionModel.findAll({
            attributes: [
                "PermissionId",
                "ModuleId",
                "RoleId",
                "CanRead",
                "CanWrite",
                [Sequelize.col("module.ModulesName"), 'ModulesName'],
            ],
            where: { RoleId: UserDetails?.RoleId },
            include: [
                {
                    model: ModulesModel,
                    attributes: []
                }
            ],
            raw: true
        });

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
                data: {
                    Branch: {
                        BranchesList: UserDetails?.BranchesList,
                        SelectBranch: UserDetails?.SelectBranch,
                    },
                    Org: {
                        OrgsList: UserDetails?.OrgsList,
                        SelectOrg: UserDetails?.SelectOrg,
                    },
                    PermissionList,
                }
            }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: { status: false, message: error.message }
        });
    };

};

exports.FetchUserListController = async (UserData) => {
    try {
        let QueryObject = {}
        if (UserData?.UserType_Id === SuperAdminID) {
            QueryObject = {
                isDeleted: false,
            }
        } else if (UserData?.UserType_Id === JuniorEngineerID) {
            QueryObject = {
                isDeleted: false,
                User_Id: { [Op.not]: SuperAdminID },
                isBranchDefault: UserData?.isBranchDefault
            }
        }

        const UserList = await UserModel.findAll({
            where: QueryObject,
            attributes:
                ['User_Id', 'User_FirstName', 'User_LastName', 'User_Avatar', 'User_Email', 'User_EmploymentNumber', 'User_ImgPath', 'createdAt', 'UserType_Id'],
            raw: true,
        });

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
                data: UserList
            }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: { status: false, message: error.message }
        });
    }
};

exports.UserModifyController = async (payloadUser, payloadBody, payloadFile) => {

    try {
        const { UserId, FirstName, LastName, UserEmail, UserNumber, Password, Language, RoleId } = payloadBody;
        if (UserId) {


        } else {

            if (!FirstName || !LastName || !UserEmail || !Password || !RoleId) {
                return ({
                    httpCode: BAD_REQUEST_CODE,
                    result: {
                        status: false,
                        message: "BAD_REQUEST_CODE",
                    }
                });
            };

            const findUser = await UserModel.findOne({
                where: {
                    [Op.or]: [
                        { Email: UserEmail || "" },
                        { Mobile: UserNumber || "" }
                    ],
                    isDeleted: false
                },
                raw: true
            });

            if (findUser?.UserId) {
                return ({
                    httpCode: SUCCESS_CODE,
                    result: {
                        status: false,
                        message: "USER_NOT_VALID",
                    }
                });
            };

            const uuid = uuidv4();

            const createdUser = await UserModel.create({
                UUID: uuid,
                FirstName: FirstName?.trim(),
                LastName: LastName?.trim(),
                AvatarName: FirstName?.[0] + LastName?.[0],
                Email: UserEmail?.trim() || null,
                Mobile: UserNumber || null,
                Password: bcrypt.hashSync(Password?.trim(), 10),
                createdAt: new Date,
                updatedAt: new Date
            });

            await OrgUsersModel.create({
                OrgId: payloadUser?.OrgId,
                BranchId: payloadUser?.BranchId,
                UserId: createdUser?.UserId,
                RoleId: RoleId,
                DefaultOrg: true
            });

            return ({
                httpCode: SUCCESS_CODE,
                result: {
                    status: true,
                    message: "USER_CREATED",
                }
            });
        };

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: { status: false, message: error.message }
        });
    };

};