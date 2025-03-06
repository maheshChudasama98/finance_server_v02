const { Op, Sequelize } = require("sequelize")
const { SuperAdminID, JuniorEngineerID, } = require("../constants/constants");
const { SUCCESS_CODE, SERVER_ERROR_CODE, BAD_REQUEST_CODE } = require("../constants/statusCode");

const db = require("../models/index");
const UserModel = db.UserModel;
const DailyLogsModel = db.DailyLogsModel;

// ------------ ||  || ------------ //

exports.DailyLogModifyController = async (payloadUser, payloadBody) => {
    try {

        const { LogId, DailyLog, Description, Icons, Color, } = payloadBody;

        if (!DailyLog) {
            return ({
                httpCode: BAD_REQUEST_CODE,
                result: { status: false, message: "BAD_REQUEST_CODE" }
            });
        };

        if (!LogId) {
            const maxPosition = await DailyLogsModel.max('Position', { where: { isDeleted: false } });
            const newPosition = maxPosition ? maxPosition + 1 : 1;

            await DailyLogsModel.create({
                DailyLog: DailyLog || null,
                Description: Description?.trim() || null,
                Icons: Icons,
                Color: Color,
                UserId: payloadUser?.User_Id,
                position: newPosition,
                isDeleted: false,
            });
            return ({
                httpCode: SUCCESS_CODE,
                result: { status: true, message: "SUCCESS" }
            });

        } else {
            await DailyLogsModel.update({
                DailyLog: DailyLog || null,
                Description: Description?.trim() || null,
                Icons: Icons,
                Color: Color,
            }, {
                where: { LogId: LogId },
            });

            return ({
                httpCode: SUCCESS_CODE,
                result: { status: true, message: "SUCCESS" }
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

exports.FetchDailyLogListController = async (UserData) => {
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

exports.TopicDragSortingController = async (payloadUser, payloadBody) => {
    try {
        const { LogId, Position } = payloadBody;

        if (!LogId || !Position) {
            return ({
                httpCode: BAD_REQUEST_CODE,
                result: { status: false, message: "BAD_REQUEST_CODE" }
            });
        };

        const target = await DailyLogsModel.findOne({
            where: {
                LogId: LogId
            },
            raw: true
        });

        if (!target) {
            return ({
                httpCode: SUCCESS_CODE,
                result: { status: false, message: "BAD_REQUEST_CODE" }
            });
        };

        const isMovingDown = Position > target.Position;

        await DailyLogsModel.update(
            { Position: Sequelize.literal(isMovingDown ? `Position - 1` : `Position + 1`) },
            {
                where: {
                    isDeleted: false,
                    Position: isMovingDown ? { [Op.gt]: target.Position, [Op.lte]: Position } : { [Op.lt]: target.Position, [Op.gte]: Position }
                },
            }
        );

        await DailyLogsModel.update(
            { Position: Position },
            {
                where: {
                    LogId: LogId,
                },
            }
        );

        return ({
            httpCode: SUCCESS_CODE,
            result: { status: true, message: "BAD_REQUEST_CODE" }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: { status: false, message: error.message }
        });
    };
};