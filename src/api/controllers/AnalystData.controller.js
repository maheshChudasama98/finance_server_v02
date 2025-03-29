const { SUCCESS_CODE, BAD_REQUEST_CODE, SERVER_ERROR_CODE } = require("../constants/statusCode");
const { getPagination, durationFindFun } = require("../../helpers/Actions.helper");
const { Op, Sequelize, fn, col, literal, } = require("sequelize");

const db = require("../models/index");

const PartiesModel = db.PartiesModel;
const AccountsModel = db.AccountsModel;
const TransactionsModel = db.TransactionsModel;
const CategoriesModel = db.CategoriesModel;
const SubCategoriesModel = db.SubCategoriesModel;

// ------------------------ || Controllers || ------------------------ //

exports.AccountController = async (payloadUser, payloadBody) => {
    try {
        let { OrgId, BranchId, UserId } = payloadUser;
        const { Action, Page, PageSize, FilterBy, SearchKey, AccountId, PartyId, CategoryId, SubCategoryId, Duration } = payloadBody;

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
            UsedBy: UserId,
            OrgId: OrgId,
            BranchId: BranchId,
            isDeleted: false,
        };

        if (Duration) {
            const { StartDate, EndDate } = await durationFindFun(Duration);
            whereCondition.Date = { [Op.between]: [StartDate, EndDate] };
        };

        if (AccountId) {
            whereCondition.AccountId = AccountId;
        };

        if (PartyId) {
            whereCondition.PartyId = PartyId;
        };

        if (CategoryId) {
            whereCondition.CategoryId = CategoryId;
        };

        if (SubCategoryId) {
            whereCondition.SubCategoryId = SubCategoryId;
        };

        if (SearchKey) {
            SearchKey?.trim()
            const fullNameCondition = Sequelize.literal(
                `CONCAT(fn_party.PartyFirstName,' ', fn_party.PartyLastName) LIKE '%${SearchKey}%'`
            );
            whereCondition[Op.or] = [
                { Action: { [Op.like]: "%" + SearchKey + "%" } },
                { Amount: { [Op.like]: "%" + SearchKey + "%" } },
                { Date: { [Op.like]: "%" + SearchKey + "%" } },
                { '$fn_account.AccountName$': { [Op.like]: "%" + SearchKey + "%" } },
                { '$fn_category.CategoryName$': { [Op.like]: "%" + SearchKey + "%" } },
                { '$fn_sub_category.SubCategoriesName$': { [Op.like]: "%" + SearchKey + "%" } },
                { '$fn_party.PartyFirstName$': { [Op.like]: "%" + SearchKey + "%" } },
                { '$fn_party.PartyLastName$': { [Op.like]: "%" + SearchKey + "%" } },
                { '$fn_party.Email$': { [Op.like]: "%" + SearchKey + "%" } },
                fullNameCondition
            ];
        };

        const fetchList = await TransactionsModel.findAll({
            attributes: [
                "TransactionId",
                "Action",
                "Date",
                "CategoryId",
                "SubCategoryId",
                "AccountId",
                "TransferToAccountId",
                "AccountAmount",
                [Sequelize.literal(`CONCAT(fn_category.CategoryName,' / ', fn_sub_category.SubCategoriesName)`), 'Details'],
                [Sequelize.col("fn_category.CategoryName"), 'CategoryName'],
                [Sequelize.col("fn_category.Icon"), 'CategoryIcon'],
                [Sequelize.col("fn_category.Color"), 'CategoryColor'],
                [Sequelize.col("fn_sub_category.SubCategoriesName"), 'SubCategoriesName'],
                [Sequelize.col("fn_sub_category.Icon"), 'SubIcon'],
            ],
            where: whereCondition,
            include: [
                {
                    model: AccountsModel,
                    attributes: [],
                },
                {
                    model: CategoriesModel,
                    attributes: [],
                },
                {
                    model: SubCategoriesModel,
                    attributes: [],
                },
                {
                    model: PartiesModel,
                    attributes: [],
                },
            ],
            limit: limit,
            offset: offset,
            order: [['Date', 'DESC']],
            raw: true,
        });

        const graphList = await TransactionsModel.findAll({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('AccountAmount')), 'Count'],
                "TransactionId",
                "Action",
                "Date",
                "CategoryId",
                "SubCategoryId",
                "AccountId",
                "TransferToAccountId",
                "AccountAmount",
            ],
            where: whereCondition,
            group: ["Date",],
            order: [['Date', 'ASC']],
            raw: true,
        });


        if (Action) {
            const totalCount = await TransactionsModel.count({
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
                        list: fetchList,
                        graphList: graphList,
                        accountDetails,
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
                    data: { list: fetchList, graphList: graphList, }
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

exports.FinanceYearController = async (payloadUser, payloadBody) => {
    try {
        let { OrgId, BranchId, UserId } = payloadUser;
        let { FilterBy } = payloadBody;

        const whereCondition = {
            UsedBy: UserId,
            OrgId: OrgId,
            BranchId: BranchId,
            isDeleted: false,
        };

        const { StartDate, EndDate } = await durationFindFun("This_Year");
        const lastYear = await durationFindFun("Last_Year");
        whereCondition.Date = { [Op.between]: [StartDate, EndDate] };

        const results = await TransactionsModel.findAll({
            attributes: [
                [fn('YEAR', col('Date')), 'duration'],
                [fn('SUM', literal(`CASE WHEN Action = 'In' THEN Amount ELSE 0 END`)), 'totalIn'],
                [fn('SUM', literal(`CASE WHEN Action = 'Out' THEN Amount ELSE 0 END`)), 'totalOut'],
                [fn('SUM', literal(`CASE WHEN Action = 'Credit' THEN Amount ELSE 0 END`)), 'totalCredit'],
                [fn('SUM', literal(`CASE WHEN Action = 'Debit' THEN Amount ELSE 0 END`)), 'totalDebit'],
                [fn('SUM', literal(`CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END`)), 'totalInvestment'],
            ],
            where: whereCondition,
            group: [fn("YEAR", col('Date'))],
            order: [[fn("YEAR", col('Date')), 'ASC']],
            limit: 1,
            raw: true,
        });

        const lastYearData = await TransactionsModel.findAll({
            attributes: [
                [fn('YEAR', col('Date')), 'duration'],
                [fn('SUM', literal(`CASE WHEN Action = 'In' THEN Amount ELSE 0 END`)), 'totalIn'],
                [fn('SUM', literal(`CASE WHEN Action = 'Out' THEN Amount ELSE 0 END`)), 'totalOut'],
                [fn('SUM', literal(`CASE WHEN Action = 'Credit' THEN Amount ELSE 0 END`)), 'totalCredit'],
                [fn('SUM', literal(`CASE WHEN Action = 'Debit' THEN Amount ELSE 0 END`)), 'totalDebit'],
                [fn('SUM', literal(`CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END`)), 'totalInvestment'],
            ],
            where: {
                ...whereCondition,
                Date: { [Op.between]: [lastYear?.StartDate, lastYear?.EndDate] }
            },
            group: [fn("YEAR", col('Date'))],
            order: [[fn("YEAR", col('Date')), 'ASC']],
            limit: 1,
            raw: true,
        });

        const fetchList = await TransactionsModel.findAll({
            attributes: [
                [fn('MONTH', col('Date')), 'month'],
                [fn('MONTHNAME', col('Date')), 'monthName'],
                [fn('SUM', literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), 'totalIn'],
                [fn('SUM', literal("CASE WHEN Action = 'Out' THEN Amount ELSE 0 END")), 'totalOut'],
                [fn('SUM', literal("CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END")), 'totalInvestment'],
                [fn('SUM', literal("CASE WHEN Action = 'Credit' THEN Amount ELSE 0 END")), 'totalCredit'],
                [fn('SUM', literal("CASE WHEN Action = 'Debit' THEN Amount ELSE 0 END")), 'totalDebit'],
            ],
            where: { ...whereCondition },
            group: [fn('YEAR', col('Date')), fn('MONTH', col('Date'))],
            order: [[fn('YEAR', col('Date')), 'DESC'], [fn('MONTH', col('Date')), 'ASC']],
            raw: true,
        });

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
                data: {
                    currentYear: results[0],
                    lastYear: lastYearData[0] || {},
                    monthBase: fetchList
                },

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

exports.TopCategoriesController = async (payloadUser, payloadBody) => {
    try {

        let { OrgId, BranchId, UserId } = payloadUser;
        let { TimeDuration, FilterBy } = payloadBody;

        const whereCondition = {
            UsedBy: UserId,
            OrgId: OrgId,
            BranchId: BranchId,
            isDeleted: false,
        };

        let timeDurationFn;
        let timeDurationKey;

        if (TimeDuration === "WEEK") {

            timeDurationFn = fn('CONCAT', 'Week-', fn('WEEK', col('Date')));
            const { StartDate, EndDate } = await durationFindFun("This_Year");
            whereCondition.Date = { [Op.between]: [StartDate, EndDate] };

        } else if (TimeDuration === "MONTH") {

            timeDurationFn = fn('MONTHNAME', col('Date'));
            const { StartDate, EndDate } = await durationFindFun("This_Year");
            whereCondition.Date = { [Op.between]: [StartDate, EndDate] };

        } else if (TimeDuration === "YEAR") {
            timeDurationFn = fn('YEAR', col('Date'));
        }

        const results = await TransactionsModel.findAll({
            attributes: [
                'CategoryId',
                [timeDurationFn, 'duration'],
                [fn(TimeDuration, col('Date')), 'durationKey'],
                [Sequelize.col("fn_category.Icon"), 'Icon'],
                [Sequelize.col("fn_category.Color"), 'Color'],
                [Sequelize.col("fn_category.CategoryName"), 'CategoryName'],
                [fn('SUM', literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), 'totalIn'],
                [fn('SUM', literal("CASE WHEN Action = 'Out' THEN Amount ELSE 0 END")), 'totalOut'],
            ],
            include: [
                {
                    model: CategoriesModel,
                    attributes: [],
                }
            ],
            where: whereCondition,
            group: [fn(TimeDuration, col('Date')), 'CategoryId'],
            order: [[fn(TimeDuration, col('Date')), 'ASC'], [fn('SUM', literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), 'DESC']],
            raw: true,
        });


        const groupedByMonth = results.reduce((acc, row) => {
            const duration = row.duration;
            const durationKey = row.durationKey;

            if (!acc[duration]) {
                acc[duration] = { duration, durationKey, topTenIn: [], topTenOut: [] };
            };

            acc[duration].topTenIn.push({
                CategoryId: row.CategoryId,
                CategoryName: row.CategoryName,
                Icon: row.Icon,
                Color: row.Color,
                totalIn: parseFloat(row.totalIn) || 0,
            });

            acc[duration].topTenOut.push({
                CategoryId: row.CategoryId,
                CategoryName: row.CategoryName,
                Icon: row.Icon,
                Color: row.Color,
                totalOut: parseFloat(row.TotalOut) || 0,
            });

            return acc;
        }, {});

        const fetchList = Object.values(groupedByMonth).map((monthData) => ({
            duration: monthData.duration,
            durationKey: monthData.durationKey,
            topTenIn: monthData.topTenIn.slice(0, FilterBy?.limit || 10),
            topTenOut: monthData.topTenOut.slice(0, FilterBy?.limit || 10),
        }));

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
                data: { list: fetchList }
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

exports.TopSubCategoriesController = async (payloadUser, payloadBody) => {
    try {
        let { OrgId, BranchId, UserId } = payloadUser;
        let { TimeDuration, FilterBy } = payloadBody;

        const whereCondition = {
            UsedBy: UserId,
            OrgId: OrgId,
            BranchId: BranchId,
            isDeleted: false,
        };

        let timeDurationFn;
        let timeDurationKey;

        if (TimeDuration === "WEEK") {

            timeDurationFn = fn('CONCAT', 'Week-', fn('WEEK', col('Date')));
            const { StartDate, EndDate } = await durationFindFun("This_Year");
            whereCondition.Date = { [Op.between]: [StartDate, EndDate] };

        } else if (TimeDuration === "MONTH") {

            timeDurationFn = fn('MONTHNAME', col('Date'));
            const { StartDate, EndDate } = await durationFindFun("This_Year");
            whereCondition.Date = { [Op.between]: [StartDate, EndDate] };

        } else if (TimeDuration === "YEAR") {

            timeDurationFn = fn('YEAR', col('Date'));

        }

        const results = await TransactionsModel.findAll({
            attributes: [
                'SubCategoryId',
                [timeDurationFn, 'duration'],
                [fn(TimeDuration, col('Date')), 'durationKey'],
                [Sequelize.col("fn_category.Color"), 'Color'],
                [Sequelize.col("fn_sub_category.SubCategoriesName"), 'SubCategoryName'],
                [Sequelize.col("fn_sub_category.Icon"), 'Icon'],
                [fn('SUM', literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), 'totalIn'],
                [fn('SUM', literal("CASE WHEN Action = 'Out' THEN Amount ELSE 0 END")), 'totalOut'],
            ],
            include: [
                {
                    model: CategoriesModel,
                    attributes: [],
                },
                {
                    model: SubCategoriesModel,
                    attributes: [],
                }
            ],
            where: whereCondition,
            group: [fn(TimeDuration, col('Date')), 'SubCategoryId'],
            order: [[fn(TimeDuration, col('Date')), 'ASC'], [fn('SUM', literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), 'DESC']],
            raw: true,
        });


        const groupedByMonth = results.reduce((acc, row) => {
            const duration = row.duration;
            const durationKey = row.durationKey;

            if (!acc[duration]) {
                acc[duration] = { duration, durationKey, topTenIn: [], topTenOut: [] };
            };

            acc[duration].topTenIn.push({
                SubCategoryId: row.SubCategoryId,
                SubCategoryName: row.SubCategoryName,
                Icon: row.Icon,
                Color: row.Color,
                totalIn: parseFloat(row.totalIn) || 0,
            });

            acc[duration].topTenOut.push({
                SubCategoryId: row.SubCategoryId,
                SubCategoryName: row.SubCategoryName,
                Icon: row.Icon,
                Color: row.Color,
                totalOut: parseFloat(row.totalOut) || 0,
            });

            return acc;
        }, {});

        const fetchList = Object.values(groupedByMonth).map((monthData) => ({
            duration: monthData.duration,
            durationKey: monthData.durationKey,
            topTenIn: monthData.topTenIn.slice(0, 10),
            topTenOut: monthData.topTenOut.slice(0, 10),
        }));

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
                data: { list: fetchList }
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

exports.DataFollController = async (payloadUser, payloadBody) => {
    try {
        let { OrgId, BranchId, UserId } = payloadUser;
        let { TimeDuration, Type, FilterBy, } = payloadBody;

        if (!TimeDuration) {
            return ({
                httpCode: BAD_REQUEST_CODE,
                result: {
                    status: false,
                    message: "BAD_REQUEST_CODE",
                }
            });
        };

        const whereCondition = {
            UsedBy: UserId,
            OrgId: OrgId,
            BranchId: BranchId,
            isDeleted: false,
            Action: { [Op.in]: ["In", "Out"] }
        };

        let timeDurationFn;
        let typeObject = ["In", "Out"];

        if (Type === "Party") {
            typeObject = ["Credit", "Debit"];
        };

        if (TimeDuration === "DATE") {
            timeDurationFn = fn('DATE', col('Date'));
            const { StartDate, EndDate } = await durationFindFun("Six_Month");
            whereCondition.Date = { [Op.between]: [StartDate, EndDate] };

        } else if (TimeDuration === "WEEK") {

            timeDurationFn = fn('CONCAT', 'Week-', fn('WEEK', col('Date')));
            const { StartDate, EndDate } = await durationFindFun("This_Year");
            whereCondition.Date = { [Op.between]: [StartDate, EndDate] };

        } else if (TimeDuration === "MONTH") {

            timeDurationFn = fn('MONTHNAME', col('Date'));
            const { StartDate, EndDate } = await durationFindFun("This_Year");
            whereCondition.Date = { [Op.between]: [StartDate, EndDate] };

        } else if (TimeDuration === "YEAR") {
            timeDurationFn = fn('YEAR', col('Date'));
        };

        const results = await TransactionsModel.findAll({
            attributes: [
                [timeDurationFn, 'duration'],
                [fn('SUM', literal(`CASE WHEN Action = '${typeObject[0]}' THEN Amount ELSE 0 END`)), 'totalIn'],
                [fn('SUM', literal(`CASE WHEN Action = '${typeObject[1]}' THEN Amount ELSE 0 END`)), 'totalOut'],
            ],
            where: whereCondition,
            group: [fn(TimeDuration, col('Date'))],
            order: [[fn(TimeDuration, col('Date')), 'ASC']],
            raw: true,
        });

        let cumulativeTotalIn = 0;
        let cumulativeTotalOut = 0;

        const updatedResults = results.map((row, index) => {
            cumulativeTotalIn += parseFloat(row.totalIn);
            cumulativeTotalOut += parseFloat(row.totalOut);

            return {
                duration: row.duration,
                totalIn: cumulativeTotalIn.toFixed(2),
                totalOut: cumulativeTotalOut.toFixed(2),
            };
        });

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
                data: {
                    list: results,
                    increment: updatedResults
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

exports.SingleDataController = async (payloadUser, payloadBody) => {
    try {
        let { OrgId, BranchId, UserId } = payloadUser;
        let { TimeDuration, FilterBy } = payloadBody;

        if (!TimeDuration) {
            return ({
                httpCode: BAD_REQUEST_CODE,
                result: {
                    status: false,
                    message: "BAD_REQUEST_CODE",
                }
            });
        };

        const whereCondition = {
            UsedBy: UserId,
            OrgId: OrgId,
            BranchId: BranchId,
            isDeleted: false,
        };
        let groupBy = "AccountId";

        if (FilterBy?.AccountId && FilterBy?.AccountId) {
            whereCondition.AccountId = { [Op.eq]: FilterBy?.AccountId };
            groupBy = "AccountId";
        };

        if (FilterBy?.CategoryId) {
            whereCondition.CategoryId = { [Op.eq]: FilterBy?.CategoryId };
            groupBy = "CategoryId";
        };

        if (FilterBy?.SubCategoryId) {
            whereCondition.SubCategoryId = { [Op.eq]: FilterBy?.SubCategoryId };
            groupBy = "SubCategoryId";
        };

        if (FilterBy?.PartyId) {
            whereCondition.PartyId = { [Op.eq]: FilterBy?.PartyId };
            groupBy = "PartyId";
        };

        let timeDurationFn;

        if (TimeDuration === "DATE") {

            timeDurationFn = fn('DATE', col('Date'));
            const { StartDate, EndDate } = await durationFindFun("Six_Month");
            whereCondition.Date = { [Op.between]: [StartDate, EndDate] };

        } else if (TimeDuration === "WEEK") {

            timeDurationFn = fn('CONCAT', 'Week-', fn('WEEK', col('Date')));
            const { StartDate, EndDate } = await durationFindFun("This_Year");
            whereCondition.Date = { [Op.between]: [StartDate, EndDate] };

        } else if (TimeDuration === "MONTH") {

            timeDurationFn = fn('MONTHNAME', col('Date'));
            const { StartDate, EndDate } = await durationFindFun("This_Year");
            whereCondition.Date = { [Op.between]: [StartDate, EndDate] };

        } else if (TimeDuration === "YEAR") {
            timeDurationFn = fn('YEAR', col('Date'));
        };

        const results = await TransactionsModel.findAll({
            attributes: [
                [timeDurationFn, 'duration'],
                [fn('SUM', literal("CASE WHEN Action = 'In' OR Action = 'To' OR Action ='Credit' THEN Amount ELSE 0 END")), 'totalIn'],
                [fn('SUM', literal("CASE WHEN Action = 'Out' OR Action = 'From' OR Action = 'Investment' OR Action ='Debit' THEN Amount ELSE 0 END")), 'totalOut'],
            ],
            where: whereCondition,
            group: [fn(TimeDuration, col('Date')), groupBy],
            order: [[fn(TimeDuration, col('Date')), 'ASC']],
            raw: true,
        });

        return ({
            httpCode: SUCCESS_CODE,
            result: {
                status: true,
                message: "SUCCESS",
                data: results
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
