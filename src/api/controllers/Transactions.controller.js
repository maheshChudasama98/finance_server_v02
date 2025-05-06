const {Op, Sequelize} = require("sequelize");
const {SUCCESS_CODE, BAD_REQUEST_CODE, SERVER_ERROR_CODE} = require("../constants/statusCode");

const db = require("../models/index");

const {getPagination, durationFindFun} = require("../../helpers/Actions.helper");

const PartiesModel = db.PartiesModel;
const AccountsModel = db.AccountsModel;
const TransactionsModel = db.TransactionsModel;
const CategoriesModel = db.CategoriesModel;
const SubCategoriesModel = db.SubCategoriesModel;
const LabelsModel = db.LabelsModel;

// ------------------------ || Transactions Controllers || ------------------------ //

exports.TransactionModifyController = async (payloadUser, payloadBody) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {TransactionId, Action, Date, Amount, CategoryId, SubCategoryId, AccountId, TransferToAccountId, PartyId, Description, Tags} = payloadBody;

		if (!Action || !Date || !Amount || !AccountId) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {
					status: false,
					message: "BAD_REQUEST_CODE",
				},
			};
		}

		if (!TransactionId) {
			const dataObject = {
				Action: Action,
				Date: Date,
				Amount: Amount,
				CategoryId: CategoryId,
				SubCategoryId: SubCategoryId,
				AccountId: AccountId,
				PartyId: PartyId,
				Description: Description,
				UsedBy: UserId,
				OrgId: OrgId,
				BranchId: BranchId,
			};

			if (Tags?.length > 0) {
				dataObject.Tags = Tags.join(",");
			}

			if (TransferToAccountId) {
				dataObject.TransferToAccountId = TransferToAccountId;
			}

			let accountUpdateString = "";
			let transferUpdateString = "";
			let flagTransfer = false;
			let flagParty = false;

			switch (Action) {
				case "In":
					accountUpdateString = Sequelize.literal(`CurrentAmount + ${Amount}`);
					dataObject.AccountAmount = Amount;
					break;

				case "Out":
					accountUpdateString = Sequelize.literal(`CurrentAmount - ${Amount}`);
					dataObject.AccountAmount = Amount - Amount * 2;
					break;

				case "Transfer":
					flagTransfer = true;
					accountUpdateString = Sequelize.literal(`CurrentAmount - ${Amount}`);
					transferUpdateString = Sequelize.literal(`CurrentAmount + ${Amount}`);
					dataObject.AccountAmount = Amount - Amount * 2;
					dataObject.Action = "From";
					break;

				case "Investment":
					flagTransfer = true;
					accountUpdateString = Sequelize.literal(`CurrentAmount - ${Amount}`);
					transferUpdateString = Sequelize.literal(`CurrentAmount + ${Amount}`);
					dataObject.AccountAmount = Amount - Amount * 2;
					dataObject.Action = "Investment";
					break;
				case "Credit":
					flagParty = true;
					accountUpdateString = Sequelize.literal(`CurrentAmount + ${Amount}`);
					transferUpdateString = Sequelize.literal(`CurrentAmount - ${Amount}`);
					dataObject.AccountAmount = Amount;
					dataObject.PartyAmount = Amount - Amount * 2;
					break;
				case "Debit":
					flagParty = true;
					accountUpdateString = Sequelize.literal(`CurrentAmount - ${Amount}`);
					transferUpdateString = Sequelize.literal(`CurrentAmount + ${Amount}`);
					dataObject.AccountAmount = Amount - Amount * 2;
					dataObject.PartyAmount = Amount;
					break;
			}

			const created = await TransactionsModel.create(dataObject);

			await AccountsModel.update({CurrentAmount: accountUpdateString}, {where: {AccountId: AccountId}});

			if (flagTransfer) {
				await AccountsModel.update({CurrentAmount: transferUpdateString}, {where: {AccountId: TransferToAccountId}});

				await TransactionsModel.create({
					...dataObject,
					Action: "To",
					AccountAmount: Amount,
					AccountId: TransferToAccountId,
					TransferToAccountId: AccountId,
					ParentTransactionId: created?.TransactionId,
				});
			}

			if (flagParty) {
				await PartiesModel.update({CurrentAmount: transferUpdateString}, {where: {PartyId: PartyId}});
			}

			return {
				httpCode: SUCCESS_CODE,
				result: {status: true, message: "SUCCESS"},
			};
		} else {
			const targetTransaction = await TransactionsModel.findOne({
				where: {
					TransactionId: TransactionId,
				},
			});

			await AccountsModel.update(
				{
					CurrentAmount: Sequelize.literal(`CurrentAmount + ${targetTransaction?.AccountAmount - targetTransaction?.AccountAmount * 2}`),
				},
				{where: {AccountId: targetTransaction?.AccountId}}
			);

			if (targetTransaction?.Action == "From" || targetTransaction?.Action == "Investment") {
				await TransactionsModel.destroy({
					where: {ParentTransactionId: targetTransaction?.TransactionId},
				});

				await AccountsModel.update(
					{
						CurrentAmount: Sequelize.literal(`CurrentAmount + ${targetTransaction?.AccountAmount}`),
					},
					{where: {AccountId: targetTransaction?.TransferToAccountId}}
				);
			} else if (targetTransaction?.Action == "To") {
				// await TransactionsModel.destroy({
				//     where: { TransactionId: targetTransaction?.TransactionId }
				// });
			}

			if (targetTransaction?.Action == "Credit" || targetTransaction?.Action == "Debit") {
				await PartiesModel.update(
					{
						CurrentAmount: Sequelize.literal(`CurrentAmount + ${targetTransaction?.PartyAmount - targetTransaction?.PartyAmount * 2}`),
					},
					{where: {PartyId: targetTransaction?.PartyId}}
				);
			}

			const dataObject = {
				Action: Action,
				Date: Date,
				Amount: Amount || null,
				CategoryId: CategoryId || null,
				SubCategoryId: SubCategoryId || null,
				AccountId: AccountId || null,
				PartyId: PartyId || null,
				Description: Description || null,
				UsedBy: UserId,
				OrgId: OrgId,
				BranchId: BranchId,
			};

			if (Tags?.length > 0) {
				dataObject.Tags = Tags.join(",");
			} else {
				dataObject.Tags = null;
			}

			if (TransferToAccountId) {
				dataObject.TransferToAccountId = TransferToAccountId;
			}

			let accountUpdateString = "";
			let transferUpdateString = "";
			let flagTransfer = false;
			let flagParty = false;

			switch (Action) {
				case "In":
					accountUpdateString = Sequelize.literal(`CurrentAmount + ${Amount}`);
					dataObject.AccountAmount = Amount;
					break;

				case "Out":
					accountUpdateString = Sequelize.literal(`CurrentAmount - ${Amount}`);
					dataObject.AccountAmount = Amount - Amount * 2;
					break;

				case "Transfer":
					flagTransfer = true;
					accountUpdateString = Sequelize.literal(`CurrentAmount - ${Amount}`);
					transferUpdateString = Sequelize.literal(`CurrentAmount + ${Amount}`);
					dataObject.AccountAmount = Amount - Amount * 2;
					dataObject.Action = "From";
					break;

				case "Investment":
					flagTransfer = true;
					accountUpdateString = Sequelize.literal(`CurrentAmount - ${Amount}`);
					transferUpdateString = Sequelize.literal(`CurrentAmount + ${Amount}`);
					dataObject.AccountAmount = Amount - Amount * 2;
					dataObject.Action = "Investment";
					break;
				case "Credit":
					flagParty = true;
					accountUpdateString = Sequelize.literal(`CurrentAmount + ${Amount}`);
					transferUpdateString = Sequelize.literal(`CurrentAmount - ${Amount}`);
					dataObject.AccountAmount = Amount;
					dataObject.PartyAmount = Amount - Amount * 2;
					break;
				case "Debit":
					flagParty = true;
					accountUpdateString = Sequelize.literal(`CurrentAmount - ${Amount}`);
					transferUpdateString = Sequelize.literal(`CurrentAmount + ${Amount}`);
					dataObject.AccountAmount = Amount - Amount * 2;
					dataObject.PartyAmount = Amount;
					break;
			}

			await TransactionsModel.update(dataObject, {
				where: {
					TransactionId: TransactionId,
				},
			});

			await AccountsModel.update({CurrentAmount: accountUpdateString}, {where: {AccountId: AccountId}});

			if (flagTransfer) {
				await AccountsModel.update({CurrentAmount: transferUpdateString}, {where: {AccountId: TransferToAccountId}});

				await TransactionsModel.create({
					...dataObject,
					Action: "To",
					AccountAmount: Amount,
					AccountId: TransferToAccountId,
					TransferToAccountId: AccountId,
					ParentTransactionId: targetTransaction?.TransactionId,
				});
			}

			if (flagParty) {
				await PartiesModel.update({CurrentAmount: transferUpdateString}, {where: {PartyId: PartyId}});
			}

			return {
				httpCode: SUCCESS_CODE,
				result: {status: true, message: "SUCCESS"},
			};
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};

exports.TransactionFetchListController = async (payloadUser, payloadBody) => {
	try {
		let {OrgId, BranchId, UserId} = payloadUser;
		const {Action, Page, PageSize, FilterBy, SearchKey} = payloadBody;

		if (Action) {
			if (!Page || !PageSize) {
				return {
					httpCode: BAD_REQUEST_CODE,
					result: {
						status: false,
						message: "BAD_REQUEST_CODE",
					},
				};
			}

			var {limit, offset} = getPagination(Page, PageSize);
		}

		const whereCondition = {
			UsedBy: UserId,
			OrgId: OrgId,
			BranchId: BranchId,
			isDeleted: false,
			Action: {[Op.not]: "To"},
		};

		if (SearchKey) {
			SearchKey?.trim();
			const fullNameCondition = Sequelize.literal(`CONCAT(fn_party.PartyFirstName,' ', fn_party.PartyLastName) LIKE '%${SearchKey}%'`);
			whereCondition[Op.or] = [
				{Action: {[Op.like]: "%" + SearchKey + "%"}},
				{Amount: {[Op.like]: "%" + SearchKey + "%"}},
				{Date: {[Op.like]: "%" + SearchKey + "%"}},
				{"$fn_account.AccountName$": {[Op.like]: "%" + SearchKey + "%"}},
				{"$fn_category.CategoryName$": {[Op.like]: "%" + SearchKey + "%"}},
				{
					"$fn_sub_category.SubCategoriesName$": {
						[Op.like]: "%" + SearchKey + "%",
					},
				},
				{"$fn_party.PartyFirstName$": {[Op.like]: "%" + SearchKey + "%"}},
				{"$fn_party.PartyLastName$": {[Op.like]: "%" + SearchKey + "%"}},
				{"$fn_party.Email$": {[Op.like]: "%" + SearchKey + "%"}},
				fullNameCondition,
			];
		}

		if (FilterBy?.PartyFullName) {
			const fullNameCondition = Sequelize.literal(`CONCAT(fn_party.PartyFirstName,' ', fn_party.PartyLastName) LIKE '%${FilterBy?.PartyFullName}%'`);

			whereCondition[Op.or] = [
				{
					"$fn_party.PartyFirstName$": {
						[Op.like]: "%" + FilterBy?.PartyFullName + "%",
					},
				},
				{
					"$fn_party.PartyLastName$": {
						[Op.like]: "%" + FilterBy?.PartyFullName + "%",
					},
				},
				{
					"$fn_party.Email$": {
						[Op.like]: "%" + FilterBy?.PartyFullName + "%",
					},
				},
				fullNameCondition,
			];
		}

		if (FilterBy?.StartDate && FilterBy?.EndDate) {
			const StartDate = new Date(FilterBy.StartDate);
			const EndDate = new Date(FilterBy.EndDate);

			if (StartDate.getTime() === EndDate.getTime()) {
				EndDate.setHours(23, 59, 59, 999);
			}

			whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		} else if (FilterBy?.StartDate) {
			whereCondition.Date = {[Op.gte]: new Date(FilterBy.StartDate)};
		} else if (FilterBy?.EndDate) {
			const EndDate = new Date(FilterBy.EndDate);
			EndDate.setHours(23, 59, 59, 999);
			whereCondition.Date = {[Op.lte]: EndDate};
		} else if (SearchKey || Object.keys(FilterBy).length > 0) {
			whereCondition.Date = {[Op.gte]: new Date("2024-01-01")};
		} else {
			const {StartDate, EndDate} = await durationFindFun("Last_Thirty_Days");
			whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		}

		if (FilterBy?.AccountsIds && FilterBy?.AccountsIds?.length > 0) {
			whereCondition.AccountId = {[Op.in]: FilterBy?.AccountsIds};
		}
		if (FilterBy?.AccountsId) {
			whereCondition.AccountId = {[Op.eq]: FilterBy?.AccountsId};
		}
		if (FilterBy?.CategoryIds && FilterBy?.CategoryIds?.length > 0) {
			whereCondition.CategoryId = {[Op.in]: FilterBy?.CategoryIds};
		}
		if (FilterBy?.CategoryId) {
			whereCondition.CategoryId = {[Op.eq]: FilterBy?.CategoryId};
		}
		if (FilterBy?.SubCategoryIds && FilterBy?.SubCategoryIds?.length > 0) {
			whereCondition.SubCategoryId = {[Op.in]: FilterBy?.SubCategoryIds};
		}
		if (FilterBy?.SubCategoryId) {
			whereCondition.SubCategoryId = {[Op.eq]: FilterBy?.SubCategoryId};
		}

		if (FilterBy?.PartyIds && FilterBy?.PartyIds?.length > 0) {
			whereCondition.PartyId = {[Op.in]: FilterBy?.PartyIds};
		}
		if (FilterBy?.PartyId) {
			whereCondition.PartyId = {[Op.eq]: FilterBy?.PartyId};
		}

		if (FilterBy?.Amount && FilterBy?.Amount) {
			whereCondition.Amount = {[Op.gte]: FilterBy?.Amount};
		}
		if (FilterBy?.Actions && FilterBy?.Actions?.length > 0) {
			whereCondition.Action = {[Op.in]: FilterBy?.Actions};
		}

		if (FilterBy?.Tags && FilterBy?.Tags?.length > 0) {
			const tagConditions = FilterBy.Tags.map((tagId) => Sequelize.literal(`FIND_IN_SET(${tagId}, Tags)`));

			whereCondition[Op.and] = whereCondition[Op.and] || [];
			whereCondition[Op.and].push({
				[Op.or]: tagConditions,
			});
		}

		const fetchList = await TransactionsModel.findAll({
			attributes: [
				"TransactionId",
				"Action",
				"Date",
				"Amount",
				"CategoryId",
				"SubCategoryId",
				"AccountId",
				"TransferToAccountId",
				"ParentTransactionId",
				"PartyId",
				"AccountAmount",
				"PartyAmount",
				"Description",
				"Tags",
				"isDeleted",
				"UsedBy",
				"OrgId",
				"BranchId",
				"createdAt",
				"updatedAt",
				[Sequelize.col("fn_category.CategoryName"), "CategoryName"],
				[Sequelize.col("fn_category.Icon"), "CategoryIcon"],
				[Sequelize.col("fn_category.Icon"), "CategoryColor"],
				[Sequelize.col("fn_sub_category.SubCategoriesName"), "SubCategoriesName"],
				[
					Sequelize.literal(`(
                    SELECT JSON_OBJECT(
                        'CategoryId', fn_categories.CategoryId,
                        'CategoryName', fn_categories.CategoryName,
                        'Icon', fn_categories.Icon,
                        'Color', fn_categories.Color
                        ) 
                    FROM fn_categories AS fn_categories 
                    WHERE fn_categories.CategoryId = fn_transactions.CategoryId 
                    )`),
					"CategoryDetails",
				],
				[
					Sequelize.literal(`(
                    SELECT JSON_OBJECT(
                        'SubCategoryId', fn_sub_categories.SubCategoryId,
                        'SubCategoriesName', fn_sub_categories.SubCategoriesName,
                        'Icon', fn_sub_categories.Icon
                        ) 
                    FROM fn_sub_categories AS fn_sub_categories 
                    WHERE fn_sub_categories.SubCategoryId = fn_transactions.SubCategoryId 
                    )`),
					"SubCategoryDetails",
				],
				[
					Sequelize.literal(`(
                    SELECT JSON_OBJECT(
                        'AccountId', fn_accounts.AccountId,
                        'AccountName', fn_accounts.AccountName,
                        'ImgPath', fn_accounts.ImgPath,
                        'Icon', fn_accounts.Icon,
                        'Color', fn_accounts.Color
                        ) 
                    FROM fn_accounts AS fn_accounts 
                    WHERE fn_accounts.AccountId = fn_transactions.AccountId 
                    )`),
					"AccountDetails",
				],
				[
					Sequelize.literal(`(
                    SELECT JSON_OBJECT(
                        'AccountId', fn_accounts.AccountId,
                        'AccountName', fn_accounts.AccountName,
                        'ImgPath', fn_accounts.ImgPath,
                        'Icon', fn_accounts.Icon,
                        'Color', fn_accounts.Color
                        ) 
                    FROM fn_accounts AS fn_accounts 
                    WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId 
                    )`),
					"TransferDetails",
				],
				[
					Sequelize.literal(`(
                    SELECT JSON_OBJECT(
                        'PartyId', parties.PartyId,
                        'PartyFirstName', parties.PartyFirstName,
                        'PartyLastName', parties.PartyLastName,
                        'PartyAvatar', parties.PartyAvatar,
                        'FullName', CONCAT(parties.PartyFirstName,' ', parties.PartyLastName)
                        ) 
                    FROM fn_parties AS parties 
                    WHERE fn_transactions.PartyId = parties.PartyId 
                    )`),
					"PartyDetails",
				],
				[
					Sequelize.literal(`(
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'LabelId', fn_labels.LabelId,
                'LabelName', fn_labels.LabelName
              )
            ) 
            FROM fn_labels AS fn_labels 
            WHERE FIND_IN_SET(fn_labels.LabelId, fn_transactions.Tags)
          )`),
					"TagList",
				],
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
			order: [["Date", "DESC"]],
			raw: true,
		});

		if (Action) {
			const totalCount = await TransactionsModel.count({
				where: whereCondition,
				distinct: true,
				subQuery: false,
			});

			let totalPage = Math.ceil(totalCount / limit);

			return {
				httpCode: SUCCESS_CODE,
				result: {
					status: true,
					message: "SUCCESS",
					data: {
						list: fetchList,
						totalRecords: totalCount,
						totalPages: totalPage,
						currentPage: parseInt(Page),
					},
				},
			};
		} else {
			return {
				httpCode: SUCCESS_CODE,
				result: {
					status: true,
					message: "SUCCESS",
					data: {list: fetchList},
				},
			};
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};

exports.TransactionFetchDataController = async (payloadUser, payloadBody) => {
	try {
		let {OrgId, BranchId, UserId} = payloadUser;

		const whereCondition = {
			UsedBy: UserId,
			OrgId: OrgId,
			BranchId: BranchId,
			isDeleted: false,
		};

		const accountList = await AccountsModel.findAll({
			attributes: ["AccountId", "UUID", "AccountName", "StartAmount", "CurrentAmount", "MinAmount", "TypeId", "ImgPath", "Icon", "Color", "Description", "isUsing", "isActive"],
			where: whereCondition,
			order: [["AccountName", "ASC"]],
			raw: true,
		});

		const categoriesList = await CategoriesModel.findAll({
			attributes: [
				"CategoryId",
				"CategoryName",
				"Icon",
				"Color",
				"Description",
				"isUsing",
				"isActive",
				"createdAt",
				"updatedAt",
				[
					Sequelize.literal(`(
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'SubCategoryId', fn_sub_categories.SubCategoryId,
                                'SubCategoriesName', fn_sub_categories.SubCategoriesName,
                                'Icon', fn_sub_categories.Icon,
                                'Description', fn_sub_categories.Description,
                                'isUsing', fn_sub_categories.isUsing,
                                'isActive', fn_sub_categories.isActive,
                                'createdAt', fn_sub_categories.createdAt,
                                'updatedAt', fn_sub_categories.updatedAt
                            )
                        )
                        FROM fn_sub_categories  
                        WHERE fn_categories.CategoryId = fn_sub_categories.CategoryId 
                        AND fn_sub_categories.isDeleted = false
                    )`),
					"SubCategories",
				],
			],
			where: whereCondition,
			order: [["CategoryName", "ASC"]],
			raw: true,
		});

		const labelsList = await LabelsModel.findAll({
			attributes: ["LabelId", "LabelName", "Color", "Description", "isUsing", "isActive", "createdAt", "updatedAt"],
			where: whereCondition,
			order: [["LabelName", "ASC"]],
			raw: true,
		});

		const partyList = await PartiesModel.findAll({
			attributes: [
				"PartyId",
				"PartyFirstName",
				"PartyLastName",
				"PartyAvatar",
				"StartAmount",
				"CurrentAmount",
				"MinAmount",
				"Phone",
				"Email",
				"City",
				"State",
				"Address",
				"ImgPath",
				"Description",
				"isUsing",
				"isActive",
				"createdAt",
				"updatedAt",
				[Sequelize.literal("CONCAT(PartyFirstName, ' ', PartyLastName)"), "FullName"],
			],
			where: whereCondition,
			order: [["FullName", "ASC"]],
			raw: true,
		});

		const subCategoriesList = await SubCategoriesModel.findAll({
			attributes: ["SubCategoryId", "SubCategoriesName", "Icon", "Description", "CategoryId", "isUsing", "isActive", "createdAt", "updatedAt"],
			where: whereCondition,
			order: [["createdAt", "DESC"]],
			raw: true,
		});

		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
				data: {
					accountList,
					categoriesList,
					labelsList,
					partyList,
					subCategoriesList,
				},
			},
		};
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};

exports.TransactionRemoveController = async (payloadUser, payloadQuery) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {TransactionId} = payloadQuery;

		if (!TransactionId) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {
					status: false,
					message: "BAD_REQUEST_CODE",
				},
			};
		}
		const targetTransaction = await TransactionsModel.findOne({
			where: {
				TransactionId: TransactionId,
			},
		});

		await AccountsModel.update(
			{
				CurrentAmount: Sequelize.literal(`CurrentAmount + ${targetTransaction?.AccountAmount - targetTransaction?.AccountAmount * 2}`),
			},
			{where: {AccountId: targetTransaction?.AccountId}}
		);

		if (targetTransaction?.Action == "From" || targetTransaction?.Action == "Investment") {
			await TransactionsModel.destroy({
				where: {ParentTransactionId: targetTransaction?.TransactionId},
			});

			await AccountsModel.update(
				{
					CurrentAmount: Sequelize.literal(`CurrentAmount + ${targetTransaction?.AccountAmount}`),
				},
				{where: {AccountId: targetTransaction?.TransferToAccountId}}
			);
		} else if (targetTransaction?.Action == "To") {
			// await TransactionsModel.destroy({
			//     where: { TransactionId: targetTransaction?.TransactionId }
			// });
		}

		if (targetTransaction?.Action == "Credit" || targetTransaction?.Action == "Debit") {
			await PartiesModel.update(
				{
					CurrentAmount: Sequelize.literal(`CurrentAmount + ${targetTransaction?.PartyAmount - targetTransaction?.PartyAmount * 2}`),
				},
				{where: {PartyId: targetTransaction?.PartyId}}
			);
		}

		await TransactionsModel.destroy({
			where: {TransactionId: targetTransaction?.TransactionId},
		});

		return {
			httpCode: SUCCESS_CODE,
			result: {status: true, message: "SUCCESS"},
		};
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};
