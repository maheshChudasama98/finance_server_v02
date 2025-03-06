const { SUCCESS_CODE, BAD_REQUEST_CODE, SERVER_ERROR_CODE } = require("../constants/statusCode");
const { getPagination, durationFindFun } = require("../../helpers/Actions.helper");
const { Op, Sequelize, fn, col, literal, } = require("sequelize");

const db = require("../models/index");


const TopicsModel = db.TopicsModel;
const TasksModel = db.TasksModel;

// ------------------------ || Controllers || ------------------------ //

exports.TopicModifyController = async (payloadUser, payloadBody) => {
    try {
        let { OrgId, BranchId, UserId } = payloadUser;
        const { TopicId, TopicTitle, TopicDesc } = payloadBody;

        if (!TopicTitle) {
            return ({
                httpCode: BAD_REQUEST_CODE,
                result: { status: false, message: "BAD_REQUEST_CODE" }
            });
        };

        const findDuplicate = await TopicsModel.findOne({
            where: {
                OrgId: OrgId,
                UsedBy: UserId,
                isDeleted: false,
                BranchId: BranchId,
                TopicTitle: TopicTitle?.trim(),
            },
            raw: true
        });

        if (!TopicId) {

            if (findDuplicate?.TopicId) {
                return ({
                    httpCode: SUCCESS_CODE,
                    result: { status: false, message: "DUPLICATE" }
                });

            } else {

                const maxPosition = await TopicsModel.max('Position', {
                    where: {
                        OrgId: OrgId,
                        UsedBy: UserId,
                        isDeleted: false,
                        BranchId: BranchId,
                    }
                });

                const newPosition = maxPosition ? maxPosition + 1 : 1;

                await TopicsModel.create({
                    TopicTitle: TopicTitle?.trim() || null,
                    TopicDesc: TopicDesc,
                    Position: newPosition,
                    OrgId: OrgId,
                    UsedBy: UserId,
                    isDeleted: false,
                    BranchId: BranchId,
                });

                return ({
                    httpCode: SUCCESS_CODE,
                    result: { status: true, message: "SUCCESS" }
                });

            };

        } else {

            if (findDuplicate?.TopicId && findDuplicate?.TopicId != TopicId) {
                return ({
                    httpCode: SUCCESS_CODE,
                    result: { status: false, message: "DUPLICATE" }
                });
            } else {

                await TopicsModel.update({
                    TopicTitle: TopicTitle?.trim() || null,
                    TopicDesc: TopicDesc,
                }, {
                    where: { TopicId: TopicId },
                });

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

exports.TopicRemoveController = async (payloadUser, payloadQuery) => {
    try {
        const { OrgId, BranchId, UserId } = payloadUser;
        const { TopicId, isActive, isDeleted } = payloadQuery;

        if (!TopicId) {
            return ({
                httpCode: BAD_REQUEST_CODE,
                result: { status: false, message: "BAD_REQUEST_CODE" }
            });
        };

        let obj = {};

        if (isActive == true || isActive == false) {
            obj.isActive = isActive;
        };

        if (isDeleted == true || isDeleted == false) {

            const findRecode = await TasksModel.findOne({
                where: {
                    TopicId: TopicId,
                    isDeleted: false
                },
                raw: true
            });

            if (findRecode?.TaskId) {
                return ({
                    httpCode: SUCCESS_CODE,
                    result: { status: true, message: "CONNECTED_STRING" }
                });
            };
            obj.isDeleted = isDeleted;
        };

        await TopicsModel.update(obj, {
            where: {
                OrgId: OrgId,
                UsedBy: UserId,
                BranchId: BranchId,
                TopicId: TopicId,
            }
        });

        return ({
            httpCode: SUCCESS_CODE,
            result: { status: true, message: "SUCCESS" }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: { status: false, message: error.message }
        });
    };
};

exports.TopicListController = async (payloadUser, payloadBody) => {
    try {
        const { FilterBy } = payloadBody;
        const { OrgId, BranchId, UserId } = payloadUser;

        const whereCondition = {
            OrgId: OrgId,
            UsedBy: UserId,
            isDeleted: false,
            BranchId: BranchId,
        };

        if (FilterBy?.TopicTitle) {
            whereCondition.TopicTitle = { [Op.like]: "%" + FilterBy?.TopicTitle + "%", }
        };

        const fetchList = await TopicsModel.findAll({
            attributes: [
                "TopicId",
                "TopicTitle",
                "TopicDesc",
                "ColorCode",
                "Position",
                [
                    Sequelize.literal(`
                        (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'TaskId', kn_tasks.TaskId,
                                    'TopicId', kn_tasks.TopicId,
                                    'TaskTitle', kn_tasks.TaskTitle,
                                    'ImagePart', kn_tasks.ImagePart,
                                    'TaskDesc', kn_tasks.TaskDesc,
                                    'Position', kn_tasks.Position
                                )
                            )
                            FROM kn_tasks
                            WHERE kn_tasks.TopicId = kn_Topic.TopicId
                            AND kn_tasks.isDeleted = false
                            ORDER BY kn_tasks.Position ASC
                        )
                    `),
                    'tasks'
                ]
            ],
            where: whereCondition,
            order: [['Position', 'ASC']],
            raw: true
        });

        return ({
            httpCode: SUCCESS_CODE,
            result: { status: true, message: "SUCCESS", data: fetchList }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: { status: false, message: error.message }
        });
    };
};

exports.TopicDragSortingController = async (payloadUser, payloadBody) => {
    try {
        const { TopicId, Position } = payloadBody;
        const { OrgId, BranchId, UserId } = payloadUser;

        if (!TopicId || !Position) {
            return ({
                httpCode: BAD_REQUEST_CODE,
                result: { status: false, message: "BAD_REQUEST_CODE" }
            });
        };

        const target = await TopicsModel.findOne({
            where: {
                TopicId: TopicId
            },
            raw: true
        });

        if (!target) {
            return ({
                httpCode: BAD_REQUEST_CODE,
                result: { status: false, message: "BAD_REQUEST_CODE" }
            });
        };

        const isMovingDown = Position > target.Position;

        await TopicsModel.update(
            { Position: Sequelize.literal(isMovingDown ? `Position - 1` : `Position + 1`) },
            {
                where: {
                    isDeleted: false,
                    OrgId: OrgId,
                    UsedBy: UserId,
                    BranchId: BranchId,
                    Position: isMovingDown ? { [Op.gt]: target.Position, [Op.lte]: Position } : { [Op.lt]: target.Position, [Op.gte]: Position }
                },
            }
        );

        await TopicsModel.update(
            { Position: Position },
            {
                where: {
                    TopicId: TopicId,
                },
            }
        );

        return ({
            httpCode: SUCCESS_CODE,
            result: { status: true, message: "SUCCESS" }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: { status: false, message: error.message }
        });
    };
};

exports.TaskModifyController = async (payloadUser, payloadBody) => {
    try {

        let { OrgId, BranchId, UserId } = payloadUser;

        const { TopicId, TaskId, TaskTitle, TaskDesc } = payloadBody;

        if (!TaskTitle || !TopicId) {
            return ({
                httpCode: BAD_REQUEST_CODE,
                result: { status: false, message: "BAD_REQUEST_CODE" }
            });
        };

        const findDuplicate = await TasksModel.findOne({
            where: {
                TaskTitle: TaskTitle?.trim(),
                isDeleted: false,
                TopicId: TopicId,
                OrgId: OrgId,
                UsedBy: UserId,
                BranchId: BranchId,
            },
            raw: true
        });

        if (!TaskId) {

            if (findDuplicate?.TaskId) {
                return ({
                    httpCode: SUCCESS_CODE,
                    result: { status: false, message: "DUPLICATE" }
                });
            } else {

                const maxPosition = await TasksModel.max('Position', {
                    where: {
                        isDeleted: false,
                        OrgId: OrgId,
                        UsedBy: UserId,
                        BranchId: BranchId,
                    }
                });
                const newPosition = maxPosition ? maxPosition + 1 : 1;

                await TasksModel.create({
                    TopicId: TopicId,
                    TaskTitle: TaskTitle?.trim() || null,
                    TaskDesc: TaskDesc,
                    Position: newPosition,
                    isDeleted: false,
                    OrgId: OrgId,
                    UsedBy: UserId,
                    BranchId: BranchId,
                });

                return ({
                    httpCode: SUCCESS_CODE,
                    result: { status: true, message: "SUCCESS" }
                });
            };

        } else {

            if (findDuplicate?.TaskId && findDuplicate?.TaskId != TaskId) {
                return ({
                    httpCode: SUCCESS_CODE,
                    result: { status: false, message: "DUPLICATE" }
                });
            } else {

                await TasksModel.update({
                    TaskTitle: TaskTitle?.trim() || null,
                    TaskDesc: TaskDesc,
                }, {
                    where: { TaskId: TaskId },
                });

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

exports.TaskListController = async (payloadUser, payloadBody) => {
    try {
        const { OrgId, BranchId, UserId } = payloadUser;

        const whereCondition = {
            isDeleted: false,
            OrgId: OrgId,
            UsedBy: UserId,
            BranchId: BranchId,
        };

        const fetchList = await TasksModel.findAll({
            attributes: [
                "TaskId",
                "TaskTitle",
                "TaskDesc",
                "ImagePart",
                "TopicId",
                "Position",
                "isActive",
            ],
            where: whereCondition,
            raw: true
        });

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
                data: fetchList
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

exports.TaskRemoveController = async (payloadUser, payloadBody) => {
    try {
        const { TaskId } = payloadBody;

        if (!TaskId) {
            return ({
                httpCode: BAD_REQUEST_CODE,
                result: { status: false, message: "BAD_REQUEST_CODE" }
            });
        };

        await TasksModel.update({
            isDeleted: true
        }, {
            where: {
                TaskId: TaskId,
                isDeleted: false
            },
        });

        return ({
            httpCode: SUCCESS_CODE,
            result: { status: true, message: "SUCCESS" }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: { status: false, message: error.message }
        });
    };
};

exports.TaskDragSortingController = async (payloadUser, payloadBody) => {
    try {
        const { TaskId, Position, TopicId } = req.body;

        if (!TaskId || !Position || !TopicId) {
            return ({
                httpCode: BAD_REQUEST_CODE,
                result: { status: false, message: "BAD_REQUEST_CODE" }
            });
        };

        const target = await TasksModel.findOne({
            where: {
                TaskId: TaskId
            },
            raw: true
        });

        if (!target) {
            return ({
                httpCode: SUCCESS_CODE,
                result: { status: false, message: "DATE_NOT_FOUND" }
            });
        };

        const isMovingDown = Position > target.Position;

        await TasksModel.update(
            { Position: Sequelize.literal(isMovingDown ? `Position - 1` : `Position + 1`) },
            {
                where: {
                    isDeleted: false,
                    topicId: target.topicId,
                    Position: isMovingDown ? {
                        [Op.gt]: target.Position, [Op.lte]: Position
                    } : {
                        [Op.lt]: target.Position, [Op.gte]: Position
                    }
                },
            }
        );

        await TasksModel.update(
            {
                Position: Position,
                TopicId: TopicId
            },
            {
                where: {
                    TaskId: TaskId,
                },
            }
        );

        return ({
            httpCode: SUCCESS_CODE,
            result: { status: true, message: "SUCCESS" }
        });

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: { status: false, message: error.message }
        });
    };
};