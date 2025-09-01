const moment = require("moment");
const {v4: uuidv4} = require("uuid");
const {Op, Sequelize} = require("sequelize");

const db = require("../models/index");

const {getPagination} = require("../../helpers/Actions.helper");
const {SUCCESS_CODE, BAD_REQUEST_CODE, SERVER_ERROR_CODE} = require("../constants/statusCode");

const CategoriesModel = db.CategoriesModel;
const SubCategoriesModel = db.SubCategoriesModel;
const LabelsModel = db.LabelsModel;
const AccountsModel = db.AccountsModel;
const PartiesModel = db.PartiesModel;
const TransactionsModel = db.TransactionsModel;
const LoansModel = db.LoansModel;
const LoansRepaymentsModel = db.LoansRepaymentsModel;

function periodsBetween(start, end, frequency) {
	const s = moment(start).startOf("day");
	const e = moment(end).startOf("day");

	if (frequency === "Weekly") {
		const weeks = Math.floor(e.diff(s, "days") / 7) + 1;
		return Math.max(weeks, 1);
	}

	return e.diff(s, "months") + 1;
}

function addOnePeriod(date, frequency) {
	if (frequency === "Weekly") return moment(date).add(1, "week");
	return moment(date).add(1, "month");
}

function ratePerPeriod(annualRatePct, frequency) {
	const r = (annualRatePct || 0) / 100;
	if (frequency === "Weekly") return r / 52;
	return r / 12;
}

function buildSchedule({principal, annualRatePct, frequency, startDate, periods, emi, prePayment}) {
	const r = ratePerPeriod(annualRatePct, frequency);
	let computedEmi = emi;

	if (!computedEmi) {
		if (r > 0) {
			const pow = Math.pow(1 + r, periods);
			computedEmi = (principal * r * pow) / (pow - 1);
		} else {
			computedEmi = principal / periods;
		}
	}

	computedEmi = Math.round(computedEmi);

	const schedule = [];
	let remaining = Math.max(principal, 0);
	let dueDate = moment(startDate);
	let totalInterest = 0;
	let totalPrincipal = 0;

	for (let i = 1; i <= periods; i++) {
		if (prePayment && prePayment.amount > 0 && prePayment.applyAtPeriod === i) {
			remaining -= prePayment.amount;
			if (remaining < 0) remaining = 0;

			schedule.push({
				UUID: uuidv4(),
				Period: i - 0.5,
				DueDate: dueDate.clone().format("YYYY-MM-DD"),
				Type: "PREPAYMENT",
				AmountDue: prePayment.amount,
				InterestPart: 0,
				PrincipalPart: prePayment.amount,
				RemainingAfter: remaining,
				Status: "Paid",
			});
		}

		if (remaining <= 0) break;

		const interestPart = Math.round(remaining * r);
		let principalPart = computedEmi - interestPart;

		if (principalPart > remaining) {
			principalPart = remaining;
		}

		const actualPayment = interestPart + principalPart;
		remaining = remaining - principalPart;

		totalInterest += interestPart;
		totalPrincipal += principalPart;

		schedule.push({
			UUID: uuidv4(),
			Period: i,
			DueDate: dueDate.clone().format("YYYY-MM-DD"),
			Type: "EMI",
			AmountDue: actualPayment,
			InterestPart: interestPart,
			PrincipalPart: principalPart,
			RemainingAfter: remaining,
			Status: "Pending",
		});

		dueDate = addOnePeriod(dueDate, frequency);

		if (remaining <= 0) break;
	}

	return {
		emi: computedEmi,
		totalInterest,
		totalPrincipal,
		schedule,
	};
}

// ------------------------ || Categories Controllers || ------------------------  //
exports.CategoriesFetchListController = async (payloadUser, payloadBody) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {Action, Page, PageSize, FilterBy} = payloadBody;

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
			isDeleted: false,
			OrgId: OrgId,
			BranchId: BranchId,
		};

		if (FilterBy?.CategoryName) {
			whereCondition.CategoryName = {
				[Op.like]: "%" + FilterBy?.CategoryName + "%",
			};
		}

		if (FilterBy?.isActive == true || FilterBy?.isActive == false) {
			whereCondition.isActive = {[Op.eq]: FilterBy?.isActive};
		}

		if (FilterBy?.isUsing == true || FilterBy?.isUsing == false) {
			whereCondition.isUsing = {[Op.eq]: FilterBy?.isUsing};
		}

		if (FilterBy?.StartDate && FilterBy?.EndDate) {
			const StartDate = new Date(FilterBy.StartDate);
			const EndDate = new Date(FilterBy.EndDate);

			if (StartDate.getTime() === EndDate.getTime()) {
				EndDate.setHours(23, 59, 59, 999);
			}

			whereCondition.createdAt = {[Op.between]: [StartDate, EndDate]};
		} else if (FilterBy?.StartDate) {
			whereCondition.createdAt = {[Op.gte]: new Date(FilterBy.StartDate)};
		} else if (FilterBy?.EndDate) {
			const EndDate = new Date(FilterBy.EndDate);
			EndDate.setHours(23, 59, 59, 999);
			whereCondition.createdAt = {[Op.lte]: EndDate};
		}

		const fetchList = await CategoriesModel.findAll({
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
					// Sequelize.literal(`(
					//               SELECT COUNT(*)
					//               FROM fn_sub_categories
					//               WHERE fn_categories.CategoryId = fn_sub_categories.CategoryId
					//               AND fn_categories.isDeleted = false AND fn_sub_categories.isDeleted = false
					//           )`),
					// "TotalSubCategory",
					Sequelize.literal(`(
              SELECT JSON_OBJECT(
                  'TotalInCome', SUM(CASE WHEN fn_transactions.Action = 'In' THEN fn_transactions.Amount ELSE 0 END),
                  'TotalExpense', SUM(CASE WHEN fn_transactions.Action = 'Out' THEN fn_transactions.Amount ELSE 0 END)
              )
              FROM fn_transactions
              WHERE fn_transactions.CategoryId = fn_categories.CategoryId
              AND fn_categories.isDeleted = false
              AND fn_transactions.isDeleted = false
          )`),
					"TransactionSummary",
				],
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
                                'updatedAt', fn_sub_categories.updatedAt,
                                'TotalInCome', (SELECT  SUM(CASE WHEN fn_transactions.Action = 'In' THEN fn_transactions.Amount ELSE 0 END) FROM  fn_transactions
                                    WHERE fn_transactions.SubCategoryId = fn_sub_categories.SubCategoryId 
                                    AND fn_sub_categories.isDeleted = false
                                    AND fn_transactions.isDeleted = false
                                 ),
                                'TotalExpense', (SELECT  SUM(CASE WHEN fn_transactions.Action = 'Out' THEN fn_transactions.Amount ELSE 0 END) FROM  fn_transactions
                                    WHERE fn_transactions.SubCategoryId = fn_sub_categories.SubCategoryId 
                                    AND fn_sub_categories.isDeleted = false
                                    AND fn_transactions.isDeleted = false
                                 )
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
			limit: limit,
			offset: offset,
			order: [["createdAt", "DESC"]],
			raw: true,
		});

		if (Action) {
			const totalCount = await CategoriesModel.count({
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
			result: {
				status: false,
				message: error.message,
			},
		};
	}
};

exports.CategoryModifyController = async (payloadUser, payloadBody) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {CategoryId, CategoryName, Icon, Color, Description} = payloadBody;

		if (!CategoryName || !Icon || !Color) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		const target = await CategoriesModel.findOne({
			where: {
				UsedBy: UserId,
				CategoryName: CategoryName?.trim(),
				isDeleted: false,
				OrgId: OrgId,
				BranchId: BranchId,
			},
			raw: true,
		});

		if (!CategoryId) {
			if (target?.CategoryId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "DUPLICATE"},
				};
			} else {
				await CategoriesModel.create({
					CategoryName: CategoryName?.trim(),
					Icon: Icon,
					Color: Color,
					Description: Description,
					UsedBy: UserId,
					OrgId: OrgId,
					BranchId: BranchId,
					isDeleted: false,
				});

				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "SUCCESS"},
				};
			}
		} else {
			if (target?.CategoryId && target?.CategoryId != CategoryId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "DUPLICATE"},
				};
			} else {
				await CategoriesModel.update(
					{
						CategoryName: CategoryName?.trim() || null,
						Description: Description,
						Icon: Icon,
						Color: Color,
					},
					{where: {CategoryId: CategoryId}}
				);

				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "SUCCESS"},
				};
			}
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};

exports.CategoryActionController = async (payloadUser, payloadQuery) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {CategoryId, isActive, isUsing, isDeleted} = payloadQuery;

		if (!CategoryId) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		let obj = {};

		if (isActive == true || isActive == false) {
			obj.isActive = isActive;
		}

		if (isUsing == true || isUsing == false) {
			obj.isUsing = isUsing;
		}

		if (isDeleted == true || isDeleted == false) {
			const findRecode = await TransactionsModel.findOne({
				where: {
					CategoryId: CategoryId,
					isDeleted: false,
				},
				raw: true,
			});

			if (findRecode?.TransactionId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "CONNECTED_STRING"},
				};
			}

			obj.isDeleted = isDeleted;
			// const
		}

		await CategoriesModel.update(obj, {
			where: {
				OrgId: OrgId,
				UsedBy: UserId,
				BranchId: BranchId,
				CategoryId: CategoryId,
			},
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

// ------------------------ || Sub-Categories Controllers || ------------------------  //
exports.SubCategoriesFetchListController = async (payloadUser, payloadBody) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {Action, Page, PageSize, FilterBy, CategoryId} = payloadBody;

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
		};

		if (CategoryId != null && CategoryId != undefined) {
			whereCondition.CategoryId = {[Op.eq]: CategoryId};
		}

		if (FilterBy?.CategoryIds && FilterBy?.CategoryIds?.length > 0) {
			whereCondition.CategoryId = {[Op.in]: FilterBy?.CategoryIds};
		}

		if (FilterBy?.SubCategoriesName) {
			whereCondition.SubCategoriesName = {
				[Op.like]: "%" + FilterBy?.SubCategoriesName + "%",
			};
		}

		if (FilterBy?.isActive == true || FilterBy?.isActive == false) {
			whereCondition.isActive = {[Op.eq]: FilterBy?.isActive};
		}

		if (FilterBy?.isUsing == true || FilterBy?.isUsing == false) {
			whereCondition.isUsing = {[Op.eq]: FilterBy?.isUsing};
		}

		if (FilterBy?.StartDate && FilterBy?.EndDate) {
			const StartDate = new Date(FilterBy.StartDate);
			const EndDate = new Date(FilterBy.EndDate);

			if (StartDate.getTime() === EndDate.getTime()) {
				EndDate.setHours(23, 59, 59, 999);
			}

			whereCondition.createdAt = {[Op.between]: [StartDate, EndDate]};
		} else if (FilterBy?.StartDate) {
			whereCondition.createdAt = {[Op.gte]: new Date(FilterBy.StartDate)};
		} else if (FilterBy?.EndDate) {
			const EndDate = new Date(FilterBy.EndDate);
			EndDate.setHours(23, 59, 59, 999);
			whereCondition.createdAt = {[Op.lte]: EndDate};
		}

		const fetchList = await SubCategoriesModel.findAll({
			attributes: ["SubCategoryId", "SubCategoriesName", "Icon", "Description", "CategoryId", "isUsing", "isActive", "createdAt", "updatedAt"],
			where: whereCondition,
			limit: limit,
			offset: offset,
			order: [["createdAt", "DESC"]],
			raw: true,
		});

		if (Action) {
			const totalCount = await SubCategoriesModel.count({
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
			result: {
				status: false,
				message: error.message,
			},
		};
	}
};

exports.SubCategoryModifyController = async (payloadUser, payloadBody) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {SubCategoryId, CategoryId, SubCategoriesName, Icon, Description} = payloadBody;

		if (!CategoryId || !SubCategoriesName || !Icon) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		const target = await SubCategoriesModel.findOne({
			where: {
				SubCategoriesName: SubCategoriesName?.trim(),
				CategoryId: CategoryId,
				OrgId: OrgId,
				BranchId: BranchId,
				UsedBy: UserId,
				isDeleted: false,
			},
			raw: true,
		});

		if (!SubCategoryId) {
			if (target?.SubCategoryId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "DUPLICATE"},
				};
			} else {
				await SubCategoriesModel.create({
					SubCategoriesName: SubCategoriesName?.trim(),
					Icon: Icon,
					Description: Description?.trim(),
					CategoryId: CategoryId,
					UsedBy: UserId,
					OrgId: OrgId,
					BranchId: BranchId,
				});

				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "SUCCESS"},
				};
			}
		} else {
			if (target?.SubCategoryId && target?.SubCategoryId != SubCategoryId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "DUPLICATE"},
				};
			} else {
				await SubCategoriesModel.update(
					{
						SubCategoriesName: SubCategoriesName?.trim() || null,
						Icon: Icon,
						Description: Description,
					},
					{where: {SubCategoryId: SubCategoryId}}
				);

				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "SUCCESS"},
				};
			}
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};

exports.SubCategoryActionController = async (payloadUser, payloadQuery) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {SubCategoryId, isActive, isUsing, isDeleted} = payloadQuery;

		if (!SubCategoryId) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		let obj = {};

		if (isActive == true || isActive == false) {
			obj.isActive = isActive;
		}

		if (isUsing == true || isUsing == false) {
			obj.isUsing = isUsing;
		}

		if (isDeleted == true || isDeleted == false) {
			const findRecode = await TransactionsModel.findOne({
				where: {
					SubCategoryId: SubCategoryId,
					isDeleted: false,
				},
				raw: true,
			});

			if (findRecode?.TransactionId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "CONNECTED_STRING"},
				};
			}
			obj.isDeleted = isDeleted;
		}

		await SubCategoriesModel.update(obj, {
			where: {
				OrgId: OrgId,
				BranchId: BranchId,
				UsedBy: UserId,
				SubCategoryId: SubCategoryId,
			},
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

// ------------------------ || Labels Controllers || ------------------------  //
exports.LabelsFetchListController = async (payloadUser, payloadBody) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {Action, Page, PageSize, FilterBy} = payloadBody;

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
		};

		if (FilterBy?.LabelName) {
			whereCondition.LabelName = {[Op.like]: "%" + FilterBy?.LabelName + "%"};
		}

		if (FilterBy?.isActive == true || FilterBy?.isActive == false) {
			whereCondition.isActive = {[Op.eq]: FilterBy?.isActive};
		}

		if (FilterBy?.isUsing == true || FilterBy?.isUsing == false) {
			whereCondition.isUsing = {[Op.eq]: FilterBy?.isUsing};
		}

		if (FilterBy?.StartDate && FilterBy?.EndDate) {
			const StartDate = new Date(FilterBy.StartDate);
			const EndDate = new Date(FilterBy.EndDate);

			if (StartDate.getTime() === EndDate.getTime()) {
				EndDate.setHours(23, 59, 59, 999);
			}

			whereCondition.createdAt = {[Op.between]: [StartDate, EndDate]};
		} else if (FilterBy?.StartDate) {
			whereCondition.createdAt = {[Op.gte]: new Date(FilterBy.StartDate)};
		} else if (FilterBy?.EndDate) {
			const EndDate = new Date(FilterBy.EndDate);
			EndDate.setHours(23, 59, 59, 999);
			whereCondition.createdAt = {[Op.lte]: EndDate};
		}

		const fetchList = await LabelsModel.findAll({
			attributes: [
				"LabelId",
				"LabelName",
				"Color",
				"Description",
				"isUsing",
				"isActive",
				"createdAt",
				"updatedAt",
				// [
				// 	Sequelize.literal(`(
				//                 SELECT JSON_OBJECT(
				//                     'TotalInCome', SUM(CASE WHEN fn_transactions.Action = 'In' AND fn_transactions.Action = 'Debit' THEN fn_transactions.AccountAmount ELSE 0 END),
				//                     'TotalExpense', SUM(CASE WHEN fn_transactions.Action = 'Out' AND fn_transactions.Action = 'Credit' THEN fn_transactions.AccountAmount ELSE 0 END),
				//                     'TotalIn', SUM(CASE WHEN fn_transactions.Action IN ('In', 'To', 'Debit') THEN fn_transactions.AccountAmount ELSE 0 END),
				//                     'TotalOut', SUM(CASE WHEN fn_transactions.Action IN ('Out', 'From', 'Investment', 'Credit') THEN fn_transactions.AccountAmount ELSE 0 END)
				//                 )
				//                 FROM fn_transactions
				//                 WHERE fn_transactions.AccountId = fn_accounts.AccountId
				//                 AND fn_transactions.isDeleted = false
				//                 AND fn_accounts.isDeleted = false
				//             )`),
				// 	"TransactionSummary",
				// ],
			],
			where: whereCondition,
			limit: limit,
			offset: offset,
			order: [["LabelName", "DESC"]],
			raw: true,
		});

		if (Action) {
			const totalCount = await LabelsModel.count({
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
			result: {
				status: false,
				message: error.message,
			},
		};
	}
};

exports.LabelModifyController = async (payloadUser, payloadBody) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {LabelId, LabelName, Color, Description} = payloadBody;

		if (!LabelName) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		const target = await LabelsModel.findOne({
			where: {
				LabelName: LabelName?.trim(),
				UsedBy: UserId,
				OrgId: OrgId,
				BranchId: BranchId,
				isDeleted: false,
			},
			raw: true,
		});

		if (!LabelId) {
			if (target?.LabelId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "DUPLICATE"},
				};
			} else {
				await LabelsModel.create({
					LabelName: LabelName?.trim(),
					Color: Color,
					Description: Description?.trim(),
					UsedBy: UserId,
					OrgId: OrgId,
					BranchId: BranchId,
				});

				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "SUCCESS"},
				};
			}
		} else {
			if (target?.LabelId && target?.LabelId != LabelId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "DUPLICATE"},
				};
			} else {
				await LabelsModel.update(
					{
						LabelName: LabelName?.trim() || null,
						Color: Color,
						Description: Description,
					},
					{where: {LabelId: LabelId}}
				);

				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "SUCCESS"},
				};
			}
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};

exports.LabelActionController = async (payloadUser, payloadQuery) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {LabelId, isActive, isUsing, isDeleted} = payloadQuery;

		if (!LabelId) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		let obj = {};

		if (isActive == true || isActive == false) {
			obj.isActive = isActive;
		}

		if (isUsing == true || isUsing == false) {
			obj.isUsing = isUsing;
		}

		if (isDeleted == true || isDeleted == false) {
			const findRecode = await TransactionsModel.findOne({
				where: {
					Tags: {[Op.like]: "%" + LabelId + "%"},
					isDeleted: false,
				},
				raw: true,
			});

			if (findRecode?.TransactionId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "CONNECTED_STRING"},
				};
			}

			obj.isDeleted = isDeleted;
		}

		await LabelsModel.update(obj, {
			where: {
				OrgId: OrgId,
				BranchId: BranchId,
				UsedBy: UserId,
				LabelId: LabelId,
			},
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

// ------------------------ || Accounts Controllers || ------------------------  //
exports.AccountsFetchListController = async (payloadUser, payloadBody) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
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
		};

		if (SearchKey) {
			whereCondition[Op.or] = [
				{AccountName: {[Op.like]: "%" + SearchKey + "%"}},
				{StartAmount: {[Op.like]: "%" + SearchKey + "%"}},
				{CurrentAmount: {[Op.like]: "%" + SearchKey + "%"}},
				{MinAmount: {[Op.like]: "%" + SearchKey + "%"}},
			];
		}

		if (FilterBy?.AccountName) {
			whereCondition.AccountName = {
				[Op.like]: "%" + FilterBy?.AccountName + "%",
			};
		}

		if (FilterBy?.TypeIds && FilterBy?.TypeIds?.length > 0) {
			whereCondition.TypeId = {[Op.in]: FilterBy?.TypeIds};
		}

		if (FilterBy?.TypeId) {
			whereCondition.TypeId = {[Op.eq]: FilterBy?.TypeId};
		}

		if (FilterBy?.isActive == true || FilterBy?.isActive == false) {
			whereCondition.isActive = {[Op.eq]: FilterBy?.isActive};
		}

		if (FilterBy?.isUsing == true || FilterBy?.isUsing == false) {
			whereCondition.isUsing = {[Op.eq]: FilterBy?.isUsing};
		}

		if (FilterBy?.StartDate && FilterBy?.EndDate) {
			const StartDate = new Date(FilterBy.StartDate);
			const EndDate = new Date(FilterBy.EndDate);

			if (StartDate.getTime() === EndDate.getTime()) {
				EndDate.setHours(23, 59, 59, 999);
			}

			whereCondition.createdAt = {[Op.between]: [StartDate, EndDate]};
		} else if (FilterBy?.StartDate) {
			whereCondition.createdAt = {[Op.gte]: new Date(FilterBy.StartDate)};
		} else if (FilterBy?.EndDate) {
			const EndDate = new Date(FilterBy.EndDate);
			EndDate.setHours(23, 59, 59, 999);
			whereCondition.createdAt = {[Op.lte]: EndDate};
		}

		const fetchList = await AccountsModel.findAll({
			attributes: [
				"AccountId",
				"AccountName",
				"StartAmount",
				"CurrentAmount",
				"MinAmount",
				"MaxAmount",
				"TypeId",
				"ImgPath",
				"Icon",
				"Color",
				"Description",
				"isUsing",
				"isActive",
				"createdAt",
				"updatedAt",
				[
					Sequelize.literal(`(
                        SELECT JSON_OBJECT(
                            'TotalInCome', SUM(CASE WHEN fn_transactions.Action = 'In' AND fn_transactions.Action = 'Debit' THEN fn_transactions.AccountAmount ELSE 0 END),
                            'TotalExpense', SUM(CASE WHEN fn_transactions.Action = 'Out' AND fn_transactions.Action = 'Credit' THEN fn_transactions.AccountAmount ELSE 0 END),
                            'TotalIn', SUM(CASE WHEN fn_transactions.Action IN ('In', 'To', 'Debit') THEN fn_transactions.AccountAmount ELSE 0 END),
                            'TotalOut', SUM(CASE WHEN fn_transactions.Action IN ('Out', 'From', 'Investment', 'Credit') THEN fn_transactions.AccountAmount ELSE 0 END)
                        )
                        FROM fn_transactions
                        WHERE fn_transactions.AccountId = fn_accounts.AccountId
                        AND fn_transactions.isDeleted = false
                        AND fn_accounts.isDeleted = false
                    )`),
					"TransactionSummary",
				],
			],
			where: whereCondition,
			limit: limit,
			offset: offset,
			order: [["createdAt", "DESC"]],
			raw: true,
		});

		if (Action) {
			const totalCount = await AccountsModel.count({
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
			result: {
				status: false,
				message: error.message,
			},
		};
	}
};

exports.AccountModifyController = async (payloadUser, payloadBody) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {AccountId, AccountName, StartAmount, MinAmount, MaxAmount, TypeId, Icon, Color, Description} = payloadBody;

		if (!AccountName || !TypeId) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		const target = await AccountsModel.findOne({
			where: {
				AccountName: AccountName?.trim(),
				UsedBy: UserId,
				OrgId: OrgId,
				BranchId: BranchId,
				isDeleted: false,
			},
			raw: true,
		});

		if (!AccountId) {
			if (target?.AccountId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "DUPLICATE"},
				};
			} else {
				// set image here

				await AccountsModel.create({
					UUID: uuidv4(),
					AccountName: AccountName?.trim(),
					StartAmount: StartAmount || 0,
					CurrentAmount: StartAmount || 0,
					MinAmount: MinAmount || 0,
					MaxAmount: MaxAmount || 0,
					TypeId: TypeId || null,
					Icon: Icon || null,
					Color: Color,
					Description: Description?.trim(),
					UsedBy: UserId,
					OrgId: OrgId,
					BranchId: BranchId,
				});

				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "SUCCESS"},
				};
			}
		} else {
			if (target?.AccountId && target?.AccountId != AccountId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "DUPLICATE"},
				};
			} else {
				await AccountsModel.update(
					{
						AccountName: AccountName?.trim(),
						StartAmount: StartAmount || null,
						MinAmount: MinAmount || 0,
						MaxAmount: MaxAmount || 0,
						TypeId: TypeId || null,
						Icon: Icon || null,
						Color: Color,
						Description: Description?.trim(),
					},
					{where: {AccountId: AccountId}}
				);

				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "SUCCESS"},
				};
			}
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};

exports.AccountActionController = async (payloadUser, payloadQuery) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {AccountId, isActive, isUsing, isDeleted} = payloadQuery;

		if (!AccountId) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		let obj = {};

		if (isActive == true || isActive == false) {
			obj.isActive = isActive;
		}

		if (isUsing == true || isUsing == false) {
			obj.isUsing = isUsing;
		}

		if (isDeleted == true || isDeleted == false) {
			const findRecode = await TransactionsModel.findOne({
				where: {
					[Op.or]: {
						AccountId: AccountId,
						TransferToAccountId: AccountId,
					},
					isDeleted: false,
				},
				raw: true,
			});

			if (findRecode?.TransactionId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "CONNECTED_STRING"},
				};
			}

			obj.isDeleted = isDeleted;
		}

		await AccountsModel.update(obj, {
			where: {
				OrgId: OrgId,
				BranchId: BranchId,
				UsedBy: UserId,
				AccountId: AccountId,
			},
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

// ------------------------ || Parties Controllers || ------------------------  //
exports.PartiesFetchListController = async (payloadUser, payloadBody) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
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
		};

		if (SearchKey) {
			const fullNameCondition = Sequelize.literal(`CONCAT(PartyFirstName,' ', PartyLastName) LIKE '%${SearchKey}%'`);
			whereCondition[Op.or] = [
				{PartyFirstName: {[Op.like]: "%" + SearchKey + "%"}},
				{PartyLastName: {[Op.like]: "%" + SearchKey + "%"}},
				{StartAmount: {[Op.like]: "%" + SearchKey + "%"}},
				{StartAmount: {[Op.like]: "%" + SearchKey + "%"}},
				{CurrentAmount: {[Op.like]: "%" + SearchKey + "%"}},
				{MinAmount: {[Op.like]: "%" + SearchKey + "%"}},
				{Email: {[Op.like]: "%" + SearchKey + "%"}},
				{Phone: {[Op.like]: "%" + SearchKey + "%"}},
				{City: {[Op.like]: "%" + SearchKey + "%"}},
				{State: {[Op.like]: "%" + SearchKey + "%"}},
				fullNameCondition,
			];
		}

		if (FilterBy?.PartyFullName) {
			const fullNameCondition = Sequelize.literal(`CONCAT(PartyFirstName,' ', PartyLastName) LIKE '%${FilterBy?.PartyFullName}%'`);

			whereCondition[Op.or] = [{PartyFirstName: {[Op.like]: "%" + FilterBy?.PartyFullName + "%"}}, {PartyLastName: {[Op.like]: "%" + FilterBy?.PartyFullName + "%"}}, fullNameCondition];
		}

		if (FilterBy?.PartyFirstName) {
			whereCondition.PartyFirstName = {[Op.eq]: FilterBy?.PartyFirstName};
		}

		if (FilterBy?.PartyLastName) {
			whereCondition.PartyLastName = {[Op.eq]: FilterBy?.PartyLastName};
		}

		if (FilterBy?.isActive == true || FilterBy?.isActive == false) {
			whereCondition.isActive = {[Op.eq]: FilterBy?.isActive};
		}

		if (FilterBy?.isUsing == true || FilterBy?.isUsing == false) {
			whereCondition.isUsing = {[Op.eq]: FilterBy?.isUsing};
		}

		if (FilterBy?.StartDate && FilterBy?.EndDate) {
			const StartDate = new Date(FilterBy.StartDate);
			const EndDate = new Date(FilterBy.EndDate);

			if (StartDate.getTime() === EndDate.getTime()) {
				EndDate.setHours(23, 59, 59, 999);
			}

			whereCondition.createdAt = {[Op.between]: [StartDate, EndDate]};
		} else if (FilterBy?.StartDate) {
			whereCondition.createdAt = {[Op.gte]: new Date(FilterBy.StartDate)};
		} else if (FilterBy?.EndDate) {
			const EndDate = new Date(FilterBy.EndDate);
			EndDate.setHours(23, 59, 59, 999);
			whereCondition.createdAt = {[Op.lte]: EndDate};
		}

		const fetchList = await PartiesModel.findAll({
			attributes: [
				"PartyId",
				"PartyFirstName",
				"PartyLastName",
				"PartyAvatar",
				"StartAmount",
				"CurrentAmount",
				"MinAmount",
				"MaxAmount",
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
			limit: limit,
			offset: offset,
			order: [["createdAt", "DESC"]],
			raw: true,
		});

		if (Action) {
			const totalCount = await PartiesModel.count({
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
			result: {
				status: false,
				message: error.message,
			},
		};
	}
};

exports.PartyModifyController = async (payloadUser, payloadBody) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {PartyId, PartyFirstName, PartyLastName, StartAmount, MinAmount, MaxAmount, Phone, Email, City, State, Address, Description} = payloadBody;

		if (!PartyFirstName || !PartyLastName) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		const target = await PartiesModel.findOne({
			where: {
				PartyFirstName: PartyFirstName?.trim(),
				PartyLastName: PartyLastName?.trim(),
				OrgId: OrgId,
				UsedBy: UserId,
				BranchId: BranchId,
				isDeleted: false,
			},
			raw: true,
		});

		if (!PartyId) {
			if (target?.PartyId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "DUPLICATE"},
				};
			} else {
				// set image here

				await PartiesModel.create({
					UUID: uuidv4(),
					PartyFirstName: PartyFirstName?.trim(),
					PartyLastName: PartyLastName?.trim(),
					PartyAvatar: PartyFirstName?.trim()?.[0] + PartyLastName?.trim()?.[0],
					StartAmount: StartAmount || 0,
					CurrentAmount: StartAmount || 0,
					MinAmount: MinAmount || 0,
					MaxAmount: MaxAmount || 0,
					Phone: Phone || null,
					Email: Email?.trim() || null,
					City: City?.trim() || null,
					State: State?.trim() || null,
					Address: Address?.trim(),
					Description: Description?.trim(),
					UsedBy: UserId,
					OrgId: OrgId,
					BranchId: BranchId,
				});

				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "SUCCESS"},
				};
			}
		} else {
			if (target?.PartyId && target?.PartyId != PartyId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "DUPLICATE"},
				};
			} else {
				await PartiesModel.update(
					{
						PartyFirstName: PartyFirstName?.trim(),
						PartyLastName: PartyLastName?.trim(),
						PartyAvatar: PartyFirstName?.trim()?.[0] + PartyLastName?.trim()?.[0],
						StartAmount: StartAmount || null,
						MinAmount: MinAmount || 0,
						MaxAmount: MaxAmount || 0,
						Phone: Phone || null,
						Email: Email?.trim() || null,
						City: City?.trim() || null,
						State: State?.trim() || null,
						Address: Address?.trim(),
						Description: Description?.trim(),
					},
					{where: {PartyId: PartyId}}
				);

				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "SUCCESS"},
				};
			}
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};

exports.PartyActionController = async (payloadUser, payloadQuery) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {PartyId, isActive, isUsing, isDeleted} = payloadQuery;

		if (!PartyId) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		let obj = {};

		if (isActive == true || isActive == false) {
			obj.isActive = isActive;
		}

		if (isUsing == true || isUsing == false) {
			obj.isUsing = isUsing;
		}

		if (isDeleted == true || isDeleted == false) {
			const findRecode = await TransactionsModel.findOne({
				where: {
					PartyId: PartyId,
					isDeleted: false,
				},
				raw: true,
			});

			if (findRecode?.TransactionId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "CONNECTED_STRING"},
				};
			}

			obj.isDeleted = isDeleted;
		}

		await PartiesModel.update(obj, {
			where: {
				OrgId: OrgId,
				BranchId: BranchId,
				UsedBy: UserId,
				PartyId: PartyId,
			},
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

// ------------------------ || Longs Controllers || ------------------------  //
exports.LongsFetchListController = async (payloadUser, payloadBody) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
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
		};

		if (SearchKey) {
			whereCondition[Op.or] = [
				{LoanName: {[Op.like]: "%" + SearchKey + "%"}},
				{LoanType: {[Op.like]: "%" + SearchKey + "%"}},
				{LenderName: {[Op.like]: "%" + SearchKey + "%"}},
				{LoanAmount: {[Op.like]: "%" + SearchKey + "%"}},
			];
		}

		if (FilterBy?.LoanName) {
			whereCondition.LoanName = {[Op.eq]: FilterBy?.LoanName};
		}

		if (FilterBy?.LoanType) {
			whereCondition.LoanType = {[Op.eq]: FilterBy?.LoanType};
		}

		if (FilterBy?.LenderName) {
			whereCondition.LenderName = {[Op.eq]: FilterBy?.LenderName};
		}

		if (FilterBy?.isActive == true || FilterBy?.isActive == false) {
			whereCondition.isActive = {[Op.eq]: FilterBy?.isActive};
		}

		if (FilterBy?.isUsing == true || FilterBy?.isUsing == false) {
			whereCondition.isUsing = {[Op.eq]: FilterBy?.isUsing};
		}

		if (FilterBy?.StartDate && FilterBy?.EndDate) {
			const StartDate = new Date(FilterBy.StartDate);
			const EndDate = new Date(FilterBy.EndDate);

			if (StartDate.getTime() === EndDate.getTime()) {
				EndDate.setHours(23, 59, 59, 999);
			}

			whereCondition.createdAt = {[Op.between]: [StartDate, EndDate]};
		} else if (FilterBy?.StartDate) {
			whereCondition.createdAt = {[Op.gte]: new Date(FilterBy.StartDate)};
		} else if (FilterBy?.EndDate) {
			const EndDate = new Date(FilterBy.EndDate);
			EndDate.setHours(23, 59, 59, 999);
			whereCondition.createdAt = {[Op.lte]: EndDate};
		}

		const fetchList = await LoansModel.findAll({
			attributes: [
				"LoanId",
				"LoanName",
				"LoanType",
				"LenderName",
				"LoanAmount",
				"PreAmount",
				"InterestRate",
				"EmiAmount",
				"StartDate",
				"EndDate",
				"AccountId",
				"Status",
				"RepaymentFrequency",
				"Description",
				"isUsing",
				"isActive",
				"createdAt",
				"updatedAt",
			],
			include: [
				{
					model: LoansRepaymentsModel,
				},
			],
			where: whereCondition,
			limit: limit,
			offset: offset,
			order: [["createdAt", "DESC"]],
			// raw: true,
		});

		if (Action) {
			const totalCount = await LoansModel.count({
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
			result: {
				status: false,
				message: error.message,
			},
		};
	}
};

exports.LongsModifyController = async (payloadUser, payloadBody) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {LoanId, LoanName, LoanType, LenderName, LoanAmount, PreAmount, InterestRate, RepaymentFrequency, StartDate, EndDate, EmiAmount, PreApplyAtPeriod, AccountId, Status, Description} =
			payloadBody;

		if (!LoanName || !LoanType || !LoanAmount || InterestRate == null || !StartDate || !EndDate || !RepaymentFrequency) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		const totalPeriods = periodsBetween(StartDate, EndDate, RepaymentFrequency);

		const principalAtStart = Number(LoanAmount);

		let preConfig = null;
		if (PreAmount && Number(PreAmount) > 0) {
			preConfig = {
				amount: Number(PreAmount),
				applyAtPeriod: Number(PreApplyAtPeriod) || 2,
			};
		}

		const {emi, totalInterest, totalPrincipal, schedule} = buildSchedule({
			principal: principalAtStart,
			annualRatePct: Number(InterestRate),
			frequency: RepaymentFrequency,
			startDate: StartDate,
			periods: totalPeriods,
			emi: EmiAmount ? Number(EmiAmount) : undefined,
			prePayment: preConfig,
		});

		// Duplicate check
		const existing = await LoansModel.findOne({
			where: {
				LoanName: LoanName.trim(),
				OrgId,
				UsedBy: UserId,
				BranchId,
				isDeleted: false,
				...(LoanId ? {LoanId: {[Op.ne]: LoanId}} : {}),
			},
			raw: true,
		});

		if (existing) {
			return {
				httpCode: SUCCESS_CODE,
				result: {status: false, message: "DUPLICATE"},
			};
		}

		let loanRecord;
		if (!LoanId) {
			// Create
			loanRecord = await LoansModel.create({
				UUID: uuidv4(),
				LoanName: LoanName.trim(),
				LoanType: LoanType.trim(),
				LenderName: LenderName?.trim() || null,
				LoanAmount: Number(LoanAmount),
				PreAmount: Number(PreAmount || 0), // stored as info; applied in schedule as configured
				InterestRate: Number(InterestRate),
				EmiAmount: Number(emi),
				RepaymentFrequency: RepaymentFrequency,
				StartDate,
				EndDate,
				TotalPeriods: totalPeriods,
				TotalInterestPlanned: totalInterest,
				AccountId: AccountId || null,
				Status: Status?.trim() || "Ongoing",
				Description: Description?.trim() || null,
				UsedBy: UserId,
				OrgId,
				BranchId,
			});
		} else {
			// Update
			await LoansModel.update(
				{
					LoanName: LoanName.trim(),
					LoanType: LoanType.trim(),
					LenderName: LenderName?.trim() || null,
					LoanAmount: Number(LoanAmount),
					PreAmount: Number(PreAmount || 0),
					InterestRate: Number(InterestRate),
					EmiAmount: Number(emi),
					RepaymentFrequency: RepaymentFrequency,
					StartDate,
					EndDate,
					TotalPeriods: totalPeriods,
					TotalInterestPlanned: totalInterest,
					AccountId: AccountId || null,
					Status: Status?.trim() || "Ongoing",
					Description: Description?.trim() || null,
					UsedBy: UserId,
					OrgId,
					BranchId,
				},
				{where: {LoanId}}
			);
			loanRecord = {LoanId};
			// Wipe and regenerate schedule for simplicity (if you need to preserve already-paid rows, adapt logic)
			await LoansRepaymentsModel.destroy({where: {LoanId: LoanId}});
		}

		// Persist schedule
		const repaymentRows = schedule.map((row) => ({
			UUID: uuidv4(),
			LoanId: loanRecord.LoanId || loanRecord.id,
			PeriodNo: row.Period,
			DueDate: row.DueDate,
			Type: row.Type, // "EMI" | "PREPAYMENT"
			AmountDue: row.AmountDue,
			InterestPart: row.InterestPart,
			PrincipalPart: row.PrincipalPart,
			RemainingAfter: row.RemainingAfter,
			Status: row.Status || "Pending",
			UsedBy: UserId,
			OrgId,
			BranchId,
		}));

		await LoansRepaymentsModel.bulkCreate(repaymentRows);

		// Quick preview for UI (first few rows)
		const preview = schedule
			.filter((r) => r.Type === "EMI")
			.slice(0, 3)
			.map(({Period, DueDate, AmountDue, InterestPart, PrincipalPart, RemainingAfter}) => ({
				Period,
				DueDate,
				AmountDue,
				InterestPart,
				PrincipalPart,
				RemainingAfter,
			}));

		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
				data: {
					EmiAmount: emi,
					TotalPeriods: totalPeriods,
					TotalInterestPlanned: totalInterest,
					Preview: preview,
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

exports.LongsActionController = async (payloadUser, payloadQuery) => {
	try {
		const {OrgId, BranchId, UserId} = payloadUser;
		const {LoanId, isActive, isUsing, isDeleted} = payloadQuery;

		if (!LoanId) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		let obj = {};

		if (isActive == true || isActive == false) {
			obj.isActive = isActive;
		}

		if (isUsing == true || isUsing == false) {
			obj.isUsing = isUsing;
		}

		if (isDeleted == true || isDeleted == false) {
			const findRecode = await LoansModel.findOne({
				where: {
					LoanId: LoanId,
					isDeleted: false,
				},
				raw: true,
			});

			if (findRecode?.LoanId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "CONNECTED_STRING"},
				};
			}

			obj.isDeleted = isDeleted;
		}

		await LoansModel.update(obj, {
			where: {
				OrgId: OrgId,
				BranchId: BranchId,
				UsedBy: UserId,
				PartyId: PartyId,
			},
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
