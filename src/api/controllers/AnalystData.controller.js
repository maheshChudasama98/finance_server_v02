const { SUCCESS_CODE, BAD_REQUEST_CODE, SERVER_ERROR_CODE } = require("../constants/statusCode");
const { getPagination } = require("../../helpers/Actions.helper");
const { Op, Sequelize, } = require("sequelize");

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
        const { Action, Page, PageSize, FilterBy, SearchKey, AccountId, PartyId, CategoryId, SubCategoryId } = payloadBody;

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
            // Action: { [Op.not]: "To" },
            // AccountId: AccountId
        };

        if (AccountId) {
            whereCondition.AccountId
        };

        if (PartyId) {
            whereCondition.PartyId
        };

        if (CategoryId) {
            whereCondition.CategoryId
        };

        if (SubCategoryId) {
            whereCondition.SubCategoryId
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
                [Sequelize.col("fn_category.CategoryName"), 'CategoryName'],
                [Sequelize.col("fn_category.Icon"), 'CategoryIcon'],
                [Sequelize.col("fn_category.Icon"), 'CategoryColor'],
                [Sequelize.col("fn_sub_category.SubCategoriesName"), 'SubCategoriesName'],
                [Sequelize.col("fn_sub_category.Icon"), 'SubIcon'],
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

        const accountDetails = await AccountsModel.findOne({
            attributes: [
                "AccountId",
                "AccountName",
                "StartAmount",
                "CurrentAmount",
                "MinAmount",
                "TypeId",
                "ImgPath",
                "Icon",
                "Color",
                "Description",
                "isUsing",
                "isActive",
                "createdAt",
                "updatedAt"
            ],
            where: whereCondition,
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
                    data: { list: fetchList, accountDetails }
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
