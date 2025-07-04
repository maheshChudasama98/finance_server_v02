const {SUCCESS_CODE, BAD_REQUEST_CODE, SERVER_ERROR_CODE} = require("../constants/statusCode");
const {getPagination, durationFindFun} = require("../../helpers/Actions.helper");
const {Op, Sequelize, fn, col, literal} = require("sequelize");

const db = require("../models/index");
const {AllMonths} = require("../constants/constants");
const {sequelize} = require("../../configs/Database.config");

const PartiesModel = db.PartiesModel;
const AccountsModel = db.AccountsModel;
const TransactionsModel = db.TransactionsModel;
const CategoriesModel = db.CategoriesModel;
const SubCategoriesModel = db.SubCategoriesModel;

// ------------------------ || Controllers || ------------------------ //

const getTotals = async (startDate, endDate, whereCondition) => {
	const results = await TransactionsModel.findAll({
		attributes: ["Action", [Sequelize.fn("SUM", Sequelize.col("AccountAmount")), "TotalAmount"]],
		where: {
			...whereCondition,
			Date: {[Op.between]: [startDate, endDate]},
		},
		group: ["Action"],
		raw: true,
	});

	const totals = {
		In: 0,
		Out: 0,
		From: 0,
		Investment: 0,
		Credit: 0,
		Debit: 0,
		To: 0,
	};

	results.forEach((row) => {
		if (totals[row.Action] !== undefined) {
			totals[row.Action] = parseFloat(row.TotalAmount || 0);
		}
	});

	return totals;
};

exports.DashboardController = async (payloadUser, payloadBody) => {
	try {
		let {OrgId, BranchId, UserId} = payloadUser;
		let {SelectedYear} = payloadBody;

		let StartDate, EndDate;

		if (SelectedYear) {
			StartDate = new Date(`${SelectedYear}-01-01`);
			EndDate = new Date(`${SelectedYear}-12-31`);
		} else {
			({StartDate, EndDate} = await durationFindFun("This_Year"));
		}

		const whereCondition = {
			UsedBy: UserId,
			OrgId: OrgId,
			BranchId: BranchId,
			isDeleted: false,
			Date: {[Op.between]: [StartDate, EndDate]},
		};

		const lastYear = await durationFindFun("Last_Year", StartDate);
		const lastMonth = await durationFindFun("Last_Month");
		const thisMonth = await durationFindFun("This_Month");

		// Select Year total all Action
		const results = await TransactionsModel.findOne({
			attributes: [
				[fn("YEAR", col("Date")), "duration"],
				[fn("SUM", literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), "totalIn"],
				[fn("SUM", literal("CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END")), "totalInvestment"],
				[fn("SUM", literal("CASE WHEN Action IN ('Debit', 'Payer') THEN Amount ELSE 0 END")), "totalDebit"],
				[fn("SUM", literal("CASE WHEN Action IN ('Credit', 'Buyer') THEN Amount ELSE 0 END")), "totalCredit"],
				[fn("SUM", literal("CASE WHEN Action IN ('Out', 'Installment', 'Return', 'Payer') THEN Amount ELSE 0 END")), "totalOut"],
			],
			where: whereCondition,
			group: [fn("YEAR", col("Date"))],
			order: [[fn("YEAR", col("Date")), "ASC"]],
			raw: true,
		});

		// Select graph, income, debit and investment
		const fetchList = await TransactionsModel.findAll({
			attributes: [
				[fn("MONTH", col("Date")), "month"],
				[fn("MONTHNAME", col("Date")), "monthName"],
				[fn("SUM", literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), "totalIn"],
				[fn("SUM", literal("CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END")), "totalInvestment"],
				[fn("SUM", literal("CASE WHEN Action IN ('Debit', 'Payer') THEN Amount ELSE 0 END")), "totalDebit"],
				[fn("SUM", literal("CASE WHEN Action IN ('Credit', 'Buyer') THEN Amount ELSE 0 END")), "totalCredit"],
				[fn("SUM", literal("CASE WHEN Action IN ('Out', 'Installment', 'Return', 'Payer') THEN Amount ELSE 0 END")), "totalOut"],
			],
			where: whereCondition,
			group: [fn("YEAR", col("Date")), fn("MONTH", col("Date"))],
			order: [
				[fn("YEAR", col("Date")), "DESC"],
				[fn("MONTH", col("Date")), "ASC"],
			],
			raw: true,
		});

		const monthBase = AllMonths.map(({month, monthName}) => {
			const found = fetchList.find((item) => Number(item.month) === month);
			return {
				month,
				monthName,
				totalIn: found ? found.totalIn : "0.00",
				totalOut: found ? found.totalOut : "0.00",
				totalInvestment: found ? found.totalInvestment : "0.00",
				totalCredit: found ? found.totalCredit : "0.00",
				totalDebit: found ? found.totalDebit : "0.00",
			};
		});

		const lastYearData = await TransactionsModel.findOne({
			attributes: [
				[fn("YEAR", col("Date")), "duration"],
				[fn("SUM", literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), "totalIn"],
				[fn("SUM", literal("CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END")), "totalInvestment"],
				[fn("SUM", literal("CASE WHEN Action IN ('Debit', 'Payer') THEN Amount ELSE 0 END")), "totalDebit"],
				[fn("SUM", literal("CASE WHEN Action IN ('Credit', 'Buyer') THEN Amount ELSE 0 END")), "totalCredit"],
				[fn("SUM", literal("CASE WHEN Action IN ('Out', 'Installment', 'Return', 'Buyer', 'Payer') THEN Amount ELSE 0 END")), "totalOut"],
			],
			where: {
				...whereCondition,
				Date: {[Op.between]: [lastYear?.StartDate, lastYear?.EndDate]},
			},
			group: [fn("YEAR", col("Date"))],
			order: [[fn("YEAR", col("Date")), "ASC"]],
			raw: true,
		});

		const thisMonthData = await TransactionsModel.findOne({
			attributes: [
				[fn("MONTHNAME", col("Date")), "duration"],

				// [fn("MONTH", col("Date")), "duration"],
				[fn("SUM", literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), "totalIn"],
				[fn("SUM", literal("CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END")), "totalInvestment"],
				[fn("SUM", literal("CASE WHEN Action IN ('Debit', 'Payer') THEN Amount ELSE 0 END")), "totalDebit"],
				[fn("SUM", literal("CASE WHEN Action IN ('Credit', 'Buyer') THEN Amount ELSE 0 END")), "totalCredit"],
				[fn("SUM", literal("CASE WHEN Action IN ('Out', 'Installment', 'Return', 'Buyer', 'Payer') THEN Amount ELSE 0 END")), "totalOut"],
			],
			where: {
				...whereCondition,
				Date: {[Op.between]: [thisMonth?.StartDate, thisMonth?.EndDate]},
			},
			group: [fn("MONTH", col("Date"))],
			order: [[fn("MONTH", col("Date")), "ASC"]],
			raw: true,
		});

		const lastMonthData = await TransactionsModel.findOne({
			attributes: [
				[fn("MONTHNAME", col("Date")), "duration"],
				[fn("SUM", literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), "totalIn"],
				[fn("SUM", literal("CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END")), "totalInvestment"],
				[fn("SUM", literal("CASE WHEN Action IN ('Debit', 'Payer') THEN Amount ELSE 0 END")), "totalDebit"],
				[fn("SUM", literal("CASE WHEN Action IN ('Credit', 'Buyer') THEN Amount ELSE 0 END")), "totalCredit"],
				[fn("SUM", literal("CASE WHEN Action IN ('Out', 'Installment', 'Return', 'Buyer', 'Payer') THEN Amount ELSE 0 END")), "totalOut"],
			],
			where: {
				...whereCondition,
				Date: {[Op.between]: [lastMonth?.StartDate, lastMonth?.EndDate]},
			},
			group: [fn("MONTH", col("Date"))],
			order: [[fn("MONTH", col("Date")), "ASC"]],
			raw: true,
		});

		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
				data: {
					currentYear: results || {},
					lastYear: lastYearData || {},
					currentMonth: thisMonthData,
					lastMonthData: lastMonthData,
					monthBase: monthBase,
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

exports.BalanceOverviewController = async (payloadUser, payloadBody) => {
	try {
		let {OrgId, BranchId, UserId} = payloadUser;
		const {AccountId, PartyId, CategoryId, SubCategoryId, Duration} = payloadBody;

		if (!Duration) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {
					status: false,
					message: "BAD_REQUEST_CODE",
				},
			};
		}

		const whereCondition = {
			UsedBy: UserId,
			OrgId: OrgId,
			BranchId: BranchId,
			isDeleted: false,
		};

		if (AccountId) {
			whereCondition.AccountId = AccountId;
		}

		if (PartyId) {
			whereCondition.PartyId = PartyId;
		}

		if (CategoryId) {
			whereCondition.CategoryId = CategoryId;
		}

		if (SubCategoryId) {
			whereCondition.SubCategoryId = SubCategoryId;
		}

		const {StartDate, EndDate} = await durationFindFun("All");
		whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		let timeDurationFn;

		if (Duration === "DATE") {
			timeDurationFn = fn("DATE", col("Date"));
		} else if (Duration === "WEEK") {
			timeDurationFn = fn("CONCAT", "Week-", fn("WEEK", col("Date")));
		} else if (Duration === "MONTH") {
			timeDurationFn = fn("MONTHNAME", col("Date"));
		} else if (Duration === "YEAR") {
			timeDurationFn = fn("YEAR", col("Date"));
		}

		const results = await TransactionsModel.findAll({
			attributes: [
				[timeDurationFn, "duration"],
				[fn("SUM", literal(`CASE WHEN Action = 'In' THEN Amount ELSE 0 END`)), "totalIn"],
				[fn("SUM", literal(`CASE WHEN Action = 'Out' THEN Amount ELSE 0 END`)), "totalOut"],
				[fn("SUM", literal(`CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END`)), "totalInvestment"],
				[fn("SUM", literal(`CASE WHEN Action = 'Credit' THEN Amount ELSE 0 END`)), "totalCredit"],
				[fn("SUM", literal(`CASE WHEN Action = 'Debit' THEN Amount ELSE 0 END`)), "totalDebit"],
			],
			where: whereCondition,
			group: [fn(Duration, col("Date"))],
			order: [[fn(Duration, col("Date")), "ASC"]],
			raw: true,
		});

		let cumulativeTotalIn = 0;
		let cumulativeTotalOut = 0;
		let cumulativeTotalInvestment = 0;
		let cumulativeTotalCredit = 0;
		let cumulativeTotalDebit = 0;

		const updatedResults = results.map((row, index) => {
			cumulativeTotalIn += parseFloat(row.totalIn);
			cumulativeTotalOut += parseFloat(row.totalOut);
			cumulativeTotalInvestment += parseFloat(row.totalInvestment);
			cumulativeTotalCredit += parseFloat(row.totalCredit);
			cumulativeTotalDebit += parseFloat(row.totalDebit);

			return {
				duration: row.duration,
				totalIn: cumulativeTotalIn.toFixed(2),
				totalOut: cumulativeTotalOut.toFixed(2),
				totalInvestment: cumulativeTotalInvestment.toFixed(2),
				totalCredit: cumulativeTotalCredit.toFixed(2),
				totalDebit: cumulativeTotalDebit.toFixed(2),
			};
		});

		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
				data: {
					list: results,
					increment: updatedResults,
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

exports.TopCategoriesController = async (payloadUser, payloadBody) => {
	try {
		let {OrgId, BranchId, UserId} = payloadUser;
		let {Duration, Limit, SelectedDate} = payloadBody;

		if (!Duration) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {
					status: false,
					message: "BAD_REQUEST_CODE",
				},
			};
		}

		const whereCondition = {
			UsedBy: UserId,
			OrgId: OrgId,
			BranchId: BranchId,
			isDeleted: false,
		};

		if (SelectedDate) {
			const {StartDate, EndDate} = await durationFindFun("This_Month", SelectedDate);
			whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		} else {
			const {StartDate, EndDate} = await durationFindFun("This_Month");
			whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		}

		let timeDurationFn;

		if (Duration === "WEEK") {
			timeDurationFn = fn("CONCAT", "Week-", fn("WEEK", col("Date")));
		} else if (Duration === "MONTH") {
			timeDurationFn = fn("MONTHNAME", col("Date"));
		} else if (Duration === "YEAR") {
			timeDurationFn = fn("YEAR", col("Date"));
		}

		const results = await TransactionsModel.findAll({
			attributes: [
				"CategoryId",
				[timeDurationFn, "duration"],
				[fn(Duration, col("Date")), "durationKey"],
				[Sequelize.col("fn_category.Icon"), "Icon"],
				[Sequelize.col("fn_category.Color"), "Color"],
				[Sequelize.col("fn_category.CategoryName"), "CategoryName"],
				[fn("SUM", literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), "totalIn"],
				[fn("SUM", literal("CASE WHEN Action = 'Out' THEN Amount ELSE 0 END")), "totalOut"],
			],
			include: [
				{
					model: CategoriesModel,
					attributes: [],
				},
			],
			where: whereCondition,
			group: [fn(Duration, col("Date")), "CategoryId"],
			order: [
				[fn(Duration, col("Date")), "DESC"],
				// [fn("SUM", literal("CASE WHEN Action = 'Out' THEN Amount ELSE 0 END")), "DESC"],
			],
			raw: true,
		});

		const groupedByMonth = results.reduce((acc, row) => {
			const duration = row.duration;
			const durationKey = row.durationKey;

			if (!acc[duration]) {
				acc[duration] = {duration, durationKey, topTenIn: [], topTenOut: []};
			}

			if (row.totalIn > 0) {
				acc[duration].topTenIn.push({
					CategoryId: row.CategoryId,
					CategoryName: row.CategoryName,
					Icon: row.Icon,
					Color: row.Color,
					totalIn: parseFloat(row.totalIn) || 0,
				});
			}

			if (row.totalOut > 0) {
				acc[duration].topTenOut.push({
					CategoryId: row.CategoryId,
					CategoryName: row.CategoryName,
					Icon: row.Icon,
					Color: row.Color,
					totalOut: parseFloat(row.totalOut) || 0,
				});
			}
			return acc;
		}, {});

		const fetchList = Object.values(groupedByMonth).map((monthData) => ({
			duration: monthData.duration,
			durationKey: monthData.durationKey,
			topTenIn: monthData.topTenIn.sort((a, b) => b.totalIn - a.totalIn).slice(0, Limit || 10),
			topTenOut: monthData.topTenOut.sort((a, b) => b.totalOut - a.totalOut).slice(0, Limit || 10),
		}));

		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
				data: {list: fetchList},
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

exports.TopSubCategoriesController = async (payloadUser, payloadBody) => {
	try {
		let {OrgId, BranchId, UserId} = payloadUser;
		let {Duration, SelectedDate, Limit} = payloadBody;

		let timeDurationFn;

		const whereCondition = {
			UsedBy: UserId,
			OrgId: OrgId,
			BranchId: BranchId,
			isDeleted: false,
		};

		if (SelectedDate) {
			const {StartDate, EndDate} = await durationFindFun("This_Month", SelectedDate);
			whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		} else {
			const {StartDate, EndDate} = await durationFindFun("This_Month");
			whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		}

		if (Duration === "WEEK") {
			timeDurationFn = fn("CONCAT", "Week-", fn("WEEK", col("Date")));
		} else if (Duration === "MONTH") {
			timeDurationFn = fn("MONTHNAME", col("Date"));
		} else if (Duration === "YEAR") {
			timeDurationFn = fn("YEAR", col("Date"));
		}

		const results = await TransactionsModel.findAll({
			attributes: [
				"SubCategoryId",
				[timeDurationFn, "duration"],
				[fn(Duration, col("Date")), "durationKey"],
				[Sequelize.col("fn_category.Color"), "Color"],
				[Sequelize.col("fn_sub_category.SubCategoriesName"), "SubCategoryName"],
				[Sequelize.col("fn_sub_category.Icon"), "Icon"],
				[fn("SUM", literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), "totalIn"],
				[fn("SUM", literal("CASE WHEN Action = 'Out' THEN Amount ELSE 0 END")), "totalOut"],
			],
			include: [
				{
					model: CategoriesModel,
					attributes: [],
				},
				{
					model: SubCategoriesModel,
					attributes: [],
				},
			],
			where: whereCondition,
			group: [fn(Duration, col("Date")), "SubCategoryId"],
			order: [[fn(Duration, col("Date")), "DESC"]],
			raw: true,
		});

		const groupedByMonth = results.reduce((acc, row) => {
			const duration = row.duration;
			const durationKey = row.durationKey;

			if (!acc[duration]) {
				acc[duration] = {duration, durationKey, topTenIn: [], topTenOut: []};
			}

			if (row.totalIn > 0) {
				acc[duration].topTenIn.push({
					SubCategoryId: row.SubCategoryId,
					SubCategoryName: row.SubCategoryName,
					Icon: row.Icon,
					Color: row.Color,
					totalIn: parseFloat(row.totalIn) || 0,
				});
			}

			if (row.totalOut > 0) {
				acc[duration].topTenOut.push({
					SubCategoryId: row.SubCategoryId,
					SubCategoryName: row.SubCategoryName,
					Icon: row.Icon,
					Color: row.Color,
					totalOut: parseFloat(row.totalOut) || 0,
				});
			}

			return acc;
		}, {});

		const fetchList = Object.values(groupedByMonth).map((monthData) => ({
			duration: monthData.duration,
			durationKey: monthData.durationKey,
			topTenIn: monthData.topTenIn.sort((a, b) => b.totalIn - a.totalIn).slice(0, Limit || 10),
			topTenOut: monthData.topTenOut.sort((a, b) => b.totalOut - a.totalOut).slice(0, Limit || 10),
		}));

		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
				data: {list: fetchList},
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

exports.RecodeListController = async (payloadUser, payloadBody) => {
	try {
		let {OrgId, BranchId, UserId} = payloadUser;
		const {Action, Page, PageSize, FilterBy, SearchKey, AccountId, PartyId, CategoryId, SubCategoryId, Duration} = payloadBody;

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
		let subQuery = `( SELECT  SUM(t2.AccountAmount) FROM fn_transactions t2 WHERE  t2.AccountId = fn_transactions.AccountId AND
						  (
							t2.Date < fn_transactions.Date OR
							(t2.Date = fn_transactions.Date AND t2.TransactionId <= fn_transactions.TransactionId)
						  ) AND  t2.isDeleted = false ) + ( SELECT StartAmount FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.AccountId )`;

		if (Duration) {
			const {StartDate, EndDate} = await durationFindFun(Duration);
			whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		}

		if (AccountId) {
			whereCondition.AccountId = AccountId;
		}

		if (PartyId) {
			whereCondition.PartyId = PartyId;

			subQuery = `(
				(SELECT StartAmount FROM fn_parties WHERE fn_parties.PartyId = fn_transactions.PartyId) - 
				(SELECT SUM(t2.AccountAmount)
				 FROM fn_transactions t2
				 WHERE t2.PartyId = fn_transactions.PartyId
				   AND (
					 t2.Date < fn_transactions.Date OR
					 (t2.Date = fn_transactions.Date AND t2.TransactionId <= fn_transactions.TransactionId)
				   )
				   AND t2.isDeleted = false
				)
			  )`;
		}

		if (CategoryId) {
			whereCondition.CategoryId = CategoryId;

			subQuery = `( SELECT SUM(t2.AccountAmount) FROM fn_transactions t2 WHERE t2.CategoryId = fn_transactions.CategoryId AND
						  (
							t2.Date < fn_transactions.Date OR
							(t2.Date = fn_transactions.Date AND t2.TransactionId <= fn_transactions.TransactionId)
						  ) AND  t2.isDeleted = false ) + 0`;
		}

		if (SubCategoryId) {
			whereCondition.SubCategoryId = SubCategoryId;

			subQuery = `( SELECT SUM(t2.AccountAmount) FROM fn_transactions t2 WHERE t2.SubCategoryId = fn_transactions.SubCategoryId AND
						  (
							t2.Date < fn_transactions.Date OR
							(t2.Date = fn_transactions.Date AND t2.TransactionId <= fn_transactions.TransactionId)
						  ) AND  t2.isDeleted = false ) + 0`;
		}

		if (SearchKey) {
			SearchKey?.trim();
			const fullNameCondition = Sequelize.literal(`CONCAT(fn_party.PartyFirstName,' ', fn_party.PartyLastName) LIKE '%${SearchKey}%'`);
			whereCondition[Op.or] = [
				{Action: {[Op.like]: "%" + SearchKey + "%"}},
				{Amount: {[Op.like]: "%" + SearchKey + "%"}},
				{Date: {[Op.like]: "%" + SearchKey + "%"}},
				{"$fn_account.AccountName$": {[Op.like]: "%" + SearchKey + "%"}},
				{"$fn_category.CategoryName$": {[Op.like]: "%" + SearchKey + "%"}},
				{"$fn_sub_category.SubCategoriesName$": {[Op.like]: "%" + SearchKey + "%"}},
				{"$fn_party.PartyFirstName$": {[Op.like]: "%" + SearchKey + "%"}},
				{"$fn_party.PartyLastName$": {[Op.like]: "%" + SearchKey + "%"}},
				{"$fn_party.Email$": {[Op.like]: "%" + SearchKey + "%"}},
				fullNameCondition,
			];
		}

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
				[
					Sequelize.literal(`
					  CASE 
						WHEN Action IN ('In', 'Out') THEN CONCAT(fn_category.CategoryName, ' / ', fn_sub_category.SubCategoriesName)
						WHEN Action IN ('Credit', 'Debit') THEN CONCAT(Action, ' - ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName)
						WHEN Action IN ('From', 'To') THEN CONCAT('Transfer to: ', (SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId))
						WHEN Action = 'Investment' THEN CONCAT('Invest to: ', (SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId))
						ELSE ''
					  END
					`),
					"Details",
				],
				[Sequelize.literal(subQuery), "Balance"],
				[Sequelize.col("fn_category.CategoryName"), "CategoryName"],
				[Sequelize.col("fn_category.Icon"), "CategoryIcon"],
				[Sequelize.col("fn_category.Color"), "CategoryColor"],
				[Sequelize.col("fn_sub_category.SubCategoriesName"), "SubCategoriesName"],
				[Sequelize.col("fn_sub_category.Icon"), "SubIcon"],
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

		const graphList = await TransactionsModel.findAll({
			attributes: [[Sequelize.literal(subQuery), "Balance"], "TransactionId", "Action", "Date", "CategoryId", "SubCategoryId", "AccountId", "TransferToAccountId", "AccountAmount"],
			where: whereCondition,
			group: ["Date"],
			order: [["Date", "ASC"]],
			raw: true,
		});

		// === Add Time Summary Totals ===
		const now = new Date();
		const startOfWeek = new Date(now);
		startOfWeek.setDate(now.getDate() - now.getDay());
		startOfWeek.setHours(0, 0, 0, 0);

		const startOfLastWeek = new Date(startOfWeek);
		startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
		const endOfLastWeek = new Date(startOfWeek);
		endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);

		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
		const startOfYear = new Date(now.getFullYear(), 0, 1);

		const thisWeekTotals = await getTotals(startOfWeek, now, whereCondition);
		const lastWeekTotals = await getTotals(startOfLastWeek, endOfLastWeek, whereCondition);
		const thisMonthTotals = await getTotals(startOfMonth, now, whereCondition);
		const lastMonthTotals = await getTotals(startOfLastMonth, endOfLastMonth, whereCondition);
		const thisYearTotals = await getTotals(startOfYear, now, whereCondition);

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
						graphList: graphList,
						accountDetails,
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
					data: {
						list: fetchList,
						graphList: graphList,
						timeSummary: {
							thisWeek: thisWeekTotals,
							lastWeek: lastWeekTotals,
							thisMonth: thisMonthTotals,
							lastMonth: lastMonthTotals,
							thisYear: thisYearTotals,
						},
					},
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

exports.BalanceFollController = async (payloadUser, payloadBody) => {
	try {
		let {OrgId, BranchId, UserId} = payloadUser;
		const {Duration} = payloadBody;

		const whereCondition = {
			UsedBy: UserId,
			OrgId: OrgId,
			BranchId: BranchId,
			isDeleted: false,
		};

		//  If you want to account base
		const accounts = await AccountsModel.findAll({
			where: {...whereCondition, TypeId: {[Op.in]: [1, 2]}},
			raw: true,
		});

		const allAccountIds = accounts.map((acc) => acc.AccountId);

		let subQuery = `(SELECT SUM(t2.AccountAmount) FROM fn_transactions t2 WHERE  t2.AccountId = fn_transactions.AccountId AND
						  (
							t2.Date < fn_transactions.Date OR
							(t2.Date = fn_transactions.Date AND t2.TransactionId <= fn_transactions.TransactionId)
						  ) AND  t2.isDeleted = false ) + ( SELECT StartAmount FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.AccountId )`;

		const transactions = await TransactionsModel.findAll({
			where: {
				...whereCondition,
				// Action: {[Op.in]: ["In", "Out", "Debit", "Credit", "To", "From"]},
				AccountId: {[Op.in]: allAccountIds},
			},
			attributes: [[Sequelize.literal(subQuery), "Balance"], "Date", "AccountId", "AccountAmount"],
			order: [["Date", "DESC"]],
			raw: true,
		});

		const formatDate = (d) => new Date(d).toISOString().slice(0, 10);

		const transactionMap = {};
		transactions.forEach((tx) => {
			const accId = tx.AccountId;
			const date = formatDate(tx.Date);
			const balance = parseFloat(tx.Balance);
			if (!transactionMap[accId]) transactionMap[accId] = [];
			transactionMap[accId].push({date, balance});
		});

		const allDates = [...new Set(transactions.map((tx) => formatDate(tx.Date)))].sort();

		const dailyBalanceMap = {};

		for (const date of allDates) {
			dailyBalanceMap[date] = {};

			for (const acc of accounts) {
				const accId = acc.AccountId;
				const accCreatedAt = formatDate(acc.createdAt);

				if (accCreatedAt > date) {
					dailyBalanceMap[date][accId] = 0;
					continue;
				}

				const txs = (transactionMap[accId] || []).filter((t) => t.date <= date).sort((a, b) => b.date.localeCompare(a.date)); // latest first

				if (txs.length > 0) {
					dailyBalanceMap[date][accId] = txs[0].balance;
				} else {
					dailyBalanceMap[date][accId] = parseFloat(acc.StartAmount);
				}
			}
		}

		let graphList = [];

		for (const date in dailyBalanceMap) {
			const accounts = dailyBalanceMap[date];
			let total = 0;
			for (const accId in accounts) {
				total += accounts[accId];
			}
			graphList.push({Date: date, Count: total});
			dailyBalanceMap[date] = total;
		}

		if (Duration) {
			const {StartDate, EndDate} = await durationFindFun(Duration);
			graphList = graphList.filter((entry) => entry.Date >= StartDate && entry.Date <= EndDate);
		}
		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
				data: graphList,
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

exports.PerformanceController = async (payloadUser, payloadBody) => {
	try {
		let {OrgId, BranchId, UserId} = payloadUser;
		const {AccountId, PartyId, CategoryId, SubCategoryId, Duration, SelectedDate} = payloadBody;

		if (!Duration) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {
					status: false,
					message: "BAD_REQUEST_CODE",
				},
			};
		}

		const whereCondition = {
			UsedBy: UserId,
			OrgId: OrgId,
			BranchId: BranchId,
			isDeleted: false,
		};

		let subQuery = `( SELECT  SUM(t2.AccountAmount) FROM fn_transactions t2 WHERE  t2.AccountId = fn_transactions.AccountId AND
						  (
							t2.Date < fn_transactions.Date OR
							(t2.Date = fn_transactions.Date AND t2.TransactionId <= fn_transactions.TransactionId)
						  ) AND  t2.isDeleted = false ) + ( SELECT StartAmount FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.AccountId )`;

		if (AccountId) {
			whereCondition.AccountId = AccountId;
		}

		if (PartyId) {
			whereCondition.PartyId = PartyId;

			subQuery = `(
				(SELECT StartAmount FROM fn_parties WHERE fn_parties.PartyId = fn_transactions.PartyId) - 
				(SELECT SUM(t2.AccountAmount)
				 FROM fn_transactions t2
				 WHERE t2.PartyId = fn_transactions.PartyId
				   AND (
					 t2.Date < fn_transactions.Date OR
					 (t2.Date = fn_transactions.Date AND t2.TransactionId <= fn_transactions.TransactionId)
				   )
				   AND t2.isDeleted = false
				)
			  )`;
		}

		if (CategoryId) {
			whereCondition.CategoryId = CategoryId;

			subQuery = `( SELECT SUM(t2.AccountAmount) FROM fn_transactions t2 WHERE t2.CategoryId = fn_transactions.CategoryId AND
						  (
							t2.Date < fn_transactions.Date OR
							(t2.Date = fn_transactions.Date AND t2.TransactionId <= fn_transactions.TransactionId)
						  ) AND  t2.isDeleted = false ) + 0`;
		}

		if (SubCategoryId) {
			whereCondition.SubCategoryId = SubCategoryId;

			subQuery = `( SELECT SUM(t2.AccountAmount) FROM fn_transactions t2 WHERE t2.SubCategoryId = fn_transactions.SubCategoryId AND
						  (
							t2.Date < fn_transactions.Date OR
							(t2.Date = fn_transactions.Date AND t2.TransactionId <= fn_transactions.TransactionId)
						  ) AND  t2.isDeleted = false ) + 0`;
		}

		let timeDurationFn;

		if (Duration === "DATE") {
			timeDurationFn = fn("DATE", col("Date"));
			const {StartDate, EndDate} = await durationFindFun("This_Year", SelectedDate);
			whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		} else if (Duration === "WEEK") {
			timeDurationFn = fn("CONCAT", "Week-", fn("WEEK", col("Date")));
			const {StartDate, EndDate} = await durationFindFun("This_Year", SelectedDate);
			whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		} else if (Duration === "MONTH") {
			timeDurationFn = fn("MONTHNAME", col("Date"));
			const {StartDate, EndDate} = await durationFindFun("This_Year", SelectedDate);
			whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		} else if (Duration === "YEAR") {
			timeDurationFn = fn("YEAR", col("Date"));
			const {StartDate, EndDate} = await durationFindFun("All", SelectedDate);
			whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		}

		const results = await TransactionsModel.findAll({
			attributes: [
				[timeDurationFn, "duration"],
				[fn("SUM", literal(`CASE WHEN Action = 'In' OR  Action = 'To' THEN Amount ELSE 0 END`)), "totalIn"],
				[fn("SUM", literal(`CASE WHEN Action = 'Out' OR  Action = 'From' OR Action = 'Investment' THEN Amount ELSE 0 END`)), "totalOut"],
				[fn("SUM", literal(`CASE WHEN Action = 'Debit' THEN Amount ELSE 0 END`)), "totalDebit"],
				[fn("SUM", literal(`CASE WHEN Action = 'Credit' THEN Amount ELSE 0 END`)), "totalCredit"],
			],
			where: whereCondition,
			group: [fn(Duration, col("Date"))],
			order: [[fn(Duration, col("Date")), "DESC"]],
			raw: true,
		});

		let cumulativeTotalIn = 0;
		let cumulativeTotalOut = 0;
		let cumulativeTotalDebit = 0;
		let cumulativeTotalCredit = 0;

		const combinedResults = [];

		for (const row of results) {
			const durationValue = row.duration;

			cumulativeTotalIn += parseFloat(row.totalIn);
			cumulativeTotalOut += parseFloat(row.totalOut);
			cumulativeTotalDebit += parseFloat(row.totalDebit);
			cumulativeTotalCredit += parseFloat(row.totalCredit);

			// Clone base condition
			let childWhereCondition = {...whereCondition};

			// Adjust condition for the current duration

			if (Duration === "DATE") {
				childWhereCondition.Date = sequelize.where(fn("DATE", col("Date")), durationValue);
			} else if (Duration === "WEEK") {
				childWhereCondition[Op.and] = [...(childWhereCondition[Op.and] || []), sequelize.where(fn("WEEK", col("Date")), durationValue.split("-")[1])];
			} else if (Duration === "MONTH") {
				childWhereCondition[Op.and] = [...(childWhereCondition[Op.and] || []), sequelize.where(fn("MONTHNAME", col("Date")), durationValue)];
			} else if (Duration === "YEAR") {
				childWhereCondition[Op.and] = [...(childWhereCondition[Op.and] || []), sequelize.where(fn("YEAR", col("Date")), durationValue)];
			}

			const childRecords = await TransactionsModel.findAll({
				attributes: [
					"TransactionId",
					"Date",
					"Amount",
					"Action",
					"AccountId",
					"CategoryId",
					"SubCategoryId",
					"TransferToAccountId",
					"AccountAmount",
					"ParentTransactionId",
					"Description",
					// [
					// 	Sequelize.literal(`
					//   CASE
					// 	WHEN Action IN ('In', 'Out') THEN CONCAT(fn_category.CategoryName, ' / ', fn_sub_category.SubCategoriesName  )
					// 	WHEN Action IN ('Credit', 'Debit') THEN CONCAT(Action, ' - ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName)
					// 	WHEN Action IN ('From', 'To') THEN CONCAT('Transfer to: ', (SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId))
					// 	WHEN Action = 'Investment' THEN CONCAT('Invest to: ', (SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId))
					// 	ELSE ''
					//   END
					// `),
					// 	"Details",
					// ],
					// [
					// 	Sequelize.literal(`
					// CASE
					// 	WHEN Action IN ('In', 'Out') THEN CONCAT(fn_category.CategoryName, ' / ', fn_sub_category.SubCategoriesName)
					// 	WHEN Action IN ('Credit', 'Debit') THEN CONCAT(Action, ' - ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName)
					// 	WHEN Action = 'From' THEN CONCAT('Transfer to: ', (SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId))
					// 	WHEN Action = 'Investment' THEN CONCAT('Invest into: ', (SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId))
					// 	WHEN Action = 'Refund' THEN CONCAT('Received money back to ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName)
					// 	WHEN Action = 'Return' THEN CONCAT('Paid returned money to ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName)
					// 	WHEN Action = 'Payer' THEN CONCAT('Paid for ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName , ' for ' , fn_category.CategoryName, ' / ', fn_sub_category.SubCategoriesName)
					// 	WHEN Action = 'Buyer' THEN CONCAT('Paid by ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName , ' for ' , fn_category.CategoryName, ' / ', fn_sub_category.SubCategoriesName)
					// 	WHEN Action IN ('From', 'To') THEN CONCAT('Transfer to: ', (SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId))
					// 	ELSE ''
					// END`),"Details",
					// ],
					[
						Sequelize.literal(`
        CASE
          WHEN fn_transactions.Action IN ('In', 'Out') THEN CONCAT(fn_category.CategoryName, ' / ', fn_sub_category.SubCategoriesName)
          WHEN fn_transactions.Action IN ('Credit', 'Debit') THEN CONCAT(fn_transactions.Action, ' - ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName)
          WHEN fn_transactions.Action = 'From' THEN CONCAT('Transfer to: ', (SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId))
          WHEN fn_transactions.Action = 'Investment' THEN CONCAT('Invest into: ', (SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId))
          WHEN fn_transactions.Action = 'Refund' THEN CONCAT('Received money back from ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName)
          WHEN fn_transactions.Action = 'Return' THEN CONCAT('Returned money to ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName)
          WHEN fn_transactions.Action = 'Payer' THEN CONCAT('Paid for ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName, ' for ', fn_category.CategoryName, ' / ', fn_sub_category.SubCategoriesName)
          WHEN fn_transactions.Action = 'Buyer' THEN CONCAT('Paid by ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName, ' for ', fn_category.CategoryName, ' / ', fn_sub_category.SubCategoriesName)
        WHEN fn_transactions.Action = 'Installment' THEN CONCAT('EMI to : ', (SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId))

		  WHEN fn_transactions.Action = 'To' THEN CONCAT(
            'Transfer (', 
              (SELECT pt.Action FROM fn_transactions AS pt WHERE pt.TransactionId = fn_transactions.ParentTransactionId LIMIT 1), 
              ') to: ',
              (SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId)
          )
          ELSE ''
        END
      `),
						"Details",
					],
					[
						Sequelize.literal(`
					  	CASE
					  		WHEN Action = 'To' THEN ( SELECT pt.Action  FROM fn_transactions AS pt  WHERE pt.TransactionId = fn_transactions.ParentTransactionId LIMIT 1)
							ELSE Action
					  	END
					`),
						"Action",
					],
					[Sequelize.literal(subQuery), "Balance"],
					[Sequelize.col("fn_category.CategoryName"), "CategoryName"],
					[Sequelize.col("fn_category.Icon"), "CategoryIcon"],
					[Sequelize.col("fn_category.Color"), "CategoryColor"],
					[Sequelize.col("fn_sub_category.SubCategoriesName"), "SubCategoriesName"],
					[Sequelize.col("fn_sub_category.Icon"), "SubIcon"],
					[Sequelize.col("fn_account.AccountName"), "AccountName"],
					[Sequelize.col("fn_account.Color"), "AccountColor"],
				],
				where: childWhereCondition,
				include: [
					// {
					// 	model: TransactionsModel,
					// 	as: "ParentNote",
					// 	attributes: [["Action", "ParentAction"]],
					// },
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
				raw: true,
				order: [["Date", "DESC"]],
			});

			// Push to final list
			combinedResults.push({
				duration: durationValue,
				totalIn: row.totalIn,
				totalOut: row.totalOut,
				totalDebit: row.totalDebit,
				totalCredit: row.totalCredit,
				child: childRecords,
			});
		}

		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
				data: {
					list: combinedResults,
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

exports.MonthlyReportController = async (payloadUser, payloadBody) => {
	try {
		let {OrgId, BranchId, UserId} = payloadUser;
		const {SelectedDate} = payloadBody;

		if (!SelectedDate) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {
					status: false,
					message: "BAD_REQUEST_CODE",
				},
			};
		}

		// const {StartDate, EndDate} = await durationFindFun("Last_Month", SelectedDate);
		const {StartDate, EndDate} = await durationFindFun("This_Month", SelectedDate);

		const whereCondition = {
			UsedBy: UserId,
			OrgId: OrgId,
			BranchId: BranchId,
			isDeleted: false,
			Action: {[Op.not]: "To"},
			Date: {[Op.between]: [StartDate, EndDate]},
		};

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
			where: whereCondition,
			order: [["Date", "ASC"]],
			raw: true,
		});

		let totalIn = 0;
		let totalOut = 0;
		let totalInvestment = 0;
		let totalCredit = 0;
		let totalDebit = 0;

		let categorySummary = {};
		let subCategorySummary = {};
		let subCategoryCategoryMap = {};
		let partySummary = {};
		let accountSummary = {};
		let dateSummary = {};

		fetchList.forEach((tx) => {
			const amount = parseFloat(tx.Amount) || 0;
			const action = tx.Action || "Unknown";

			if (tx.Action === "In") {
				totalIn += amount;
			} else if (tx.Action === "Out") {
				totalOut += amount;
			} else if (tx.Action === "Investment") {
				totalInvestment += amount;
			} else if (tx.Action === "Credit") {
				totalCredit += amount;
			} else if (tx.Action === "Debit") {
				totalDebit += amount;
			}

			// Category Summary
			const catName = tx.CategoryDetails?.CategoryName;
			if (catName && !categorySummary[catName]) {
				categorySummary[catName] = {
					In: 0,
					Out: 0,
				};
			}
			if (catName && categorySummary[catName][action] !== undefined) {
				categorySummary[catName][action] += amount;
			}

			// Sub-Category Summary
			const subCatName = tx.SubCategoryDetails?.SubCategoriesName;
			if (subCatName && !subCategorySummary[subCatName]) {
				subCategorySummary[subCatName] = {
					In: 0,
					Out: 0,
				};
			}
			if (subCatName && subCategorySummary[subCatName][action] !== undefined) {
				subCategorySummary[subCatName][action] += amount;
			}

			if (subCatName && catName) {
				subCategoryCategoryMap[subCatName] = catName;
			}

			// Party Summary
			const partyName = tx?.PartyDetails?.FullName;
			if (partyName && !partySummary[partyName]) {
				partySummary[partyName] = {
					Credit: 0,
					Debit: 0,
				};
			}
			if (partyName && partySummary[partyName][action] !== undefined) {
				partySummary[partyName][action] += amount;
			}

			// Account Summary
			const accountName = tx.AccountDetails?.AccountName;
			if (accountName && !accountSummary[accountName]) {
				accountSummary[accountName] = {
					In: 0,
					Out: 0,
					Investment: 0,
					Credit: 0,
					Debit: 0,
				};
			}
			if (accountName && accountSummary[accountName][action] !== undefined) {
				accountSummary[accountName][action] += amount;
			}

			const txDate = tx.Date;
			if (!dateSummary[txDate]) {
				dateSummary[txDate] = 0;
			}
			dateSummary[txDate] += amount;
		});

		const subcategoriesSummary = Object.entries(subCategorySummary).map(([subCategory, {In, Out}]) => {
			return {subCategory: subCategory, totalIn: In > 0 ? In.toFixed(2) : "", totalOut: Out > 0 ? Out.toFixed(2) : ""};
		});

		const partyRows = Object.entries(partySummary).map(([name, {Credit, Debit}]) => {
			return {name: name, totalCredit: Credit > 0 ? Credit.toFixed(2) : "", totalDebit: Debit > 0 ? Debit.toFixed(2) : ""};
		});

		const accountRows = Object.entries(accountSummary).map(([name, summary]) => {
			return {
				name: name,
				totalIn: summary.In > 0 ? summary.In.toFixed(2) : "",
				totalOut: summary.Out > 0 ? summary.Out.toFixed(2) : "",
				totalCredit: summary.Credit > 0 ? summary.Credit.toFixed(2) : "",
				totalDebit: summary.Debit > 0 ? summary.Debit.toFixed(2) : "",
				totalInvestment: summary.Investment > 0 ? summary.Investment.toFixed(2) : "",
			};
		});

		const data = {
			monthSummary: [
				{key: "Income", values: totalIn},
				{key: "Expense", values: totalOut},
				{key: "Investment", values: totalInvestment},
				{key: "Credit", values: totalCredit},
				{key: "Debit", values: totalDebit},
			],
			transactionsList: fetchList.map((r) => ({
				date: r?.Date,
				subCategoriesName: r?.SubCategoryDetails?.SubCategoriesName || "",
				action: r?.Action == "From" ? "Transfer" : r?.Action,
				accountName: r?.AccountDetails?.AccountName || "",
				partyFullName: r?.TransferDetails?.AccountName || r?.PartyDetails?.FullName || "",
				accountAmount: r?.AccountAmount,
			})),
			subcategoriesSummary,
			partySummary: partyRows,
			accountSummary: accountRows,
		};

		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
				data: data,
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

exports.MonthlyDetailedSummaryController = async (payloadUser, payloadBody) => {
	try {
		let {OrgId, BranchId, UserId} = payloadUser;
		const {Month, Year, AccountId, PartyId, CategoryId, SubCategoryId} = payloadBody;

		if (!Month || !Year) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {
					status: false,
					message: "Month and Year are required",
				},
			};
		}

		const whereCondition = {
			UsedBy: UserId,
			OrgId: OrgId,
			BranchId: BranchId,
			isDeleted: false,
		};

		// Add filters
		if (AccountId) {
			whereCondition.AccountId = AccountId;
		}
		if (PartyId) {
			whereCondition.PartyId = PartyId;
		}
		if (CategoryId) {
			whereCondition.CategoryId = CategoryId;
		}
		if (SubCategoryId) {
			whereCondition.SubCategoryId = SubCategoryId;
		}

		// Set date range for the month
		const startDate = new Date(Year, Month - 1, 1);
		const endDate = new Date(Year, Month, 0, 23, 59, 59, 999);
		whereCondition.Date = {[Op.between]: [startDate, endDate]};

		// Get all transactions for the month
		const transactions = await TransactionsModel.findAll({
			attributes: [
				"TransactionId",
				"Action",
				"Date",
				"Amount",
				"CategoryId",
				"SubCategoryId",
				"AccountId",
				"PartyId",
				"TransferToAccountId",
				"AccountAmount",
				"Description",
				[
					Sequelize.literal(`
						CASE 
							WHEN Action IN ('In', 'Out') THEN CONCAT(fn_category.CategoryName, ' / ', fn_sub_category.SubCategoriesName)
							WHEN Action IN ('Credit', 'Debit') THEN CONCAT(Action, ' - ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName)
							WHEN Action = 'From' THEN CONCAT('Transfer to: ', (SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId))
							WHEN Action = 'Investment' THEN CONCAT('Invest into: ', (SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId))
							WHEN Action = 'Refund' THEN CONCAT('Received money back from ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName)
							WHEN Action = 'Return' THEN CONCAT('Returned money to ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName)
							WHEN Action = 'Payer' THEN CONCAT('Paid for ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName, ' for ', fn_category.CategoryName, ' / ', fn_sub_category.SubCategoriesName)
							WHEN Action = 'Buyer' THEN CONCAT('Paid by ', fn_party.PartyFirstName, ' ', fn_party.PartyLastName, ' for ', fn_category.CategoryName, ' / ', fn_sub_category.SubCategoriesName)
							WHEN Action = 'Installment' THEN CONCAT('EMI to : ', (SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId))
							WHEN Action = 'To' THEN CONCAT(
								'Transfer (', 
								(SELECT pt.Action FROM fn_transactions AS pt WHERE pt.TransactionId = fn_transactions.ParentTransactionId LIMIT 1), 
								') to: ',
								(SELECT AccountName FROM fn_accounts WHERE fn_accounts.AccountId = fn_transactions.TransferToAccountId)
							)
							ELSE ''
						END
					`),
					"Details",
				],
			],
			where: whereCondition,
			include: [
				{
					model: AccountsModel,
					attributes: ["AccountName", "Color"],
				},
				{
					model: CategoriesModel,
					attributes: ["CategoryName", "Icon", "Color"],
				},
				{
					model: SubCategoriesModel,
					attributes: ["SubCategoriesName", "Icon"],
				},
				{
					model: PartiesModel,
					attributes: ["PartyFirstName", "PartyLastName"],
				},
			],
			order: [["Date", "ASC"]],
			raw: true,
		});

		// Calculate summaries
		let totalIn = 0;
		let totalOut = 0;
		let totalInvestment = 0;
		let totalCredit = 0;
		let totalDebit = 0;
		let realIncome = 0;
		let realExpense = 0;

		// Category summaries
		let categorySummary = {};
		let subCategorySummary = {};
		let partySummary = {};
		let accountSummary = {};
		let actionSummary = {};

		// Daily summaries
		let dailySummary = {};

		transactions.forEach((tx) => {
			const amount = parseFloat(tx.Amount) || 0;
			const action = tx.Action || "Unknown";

			// Basic calculations
			if (tx.Action === "In") {
				totalIn += amount;
			} else if (tx.Action === "Out") {
				totalOut += amount;
			} else if (tx.Action === "Investment") {
				totalInvestment += amount;
			} else if (tx.Action === "Credit") {
				totalCredit += amount;
			} else if (tx.Action === "Debit") {
				totalDebit += amount;
			}

			// Real financial impact calculations
			if (tx.Action === "In" || tx.Action === "Buyer" || tx.Action === "Refund") {
				realIncome += amount;
			}
			if (tx.Action === "Out" || tx.Action === "Installment" || tx.Action === "Return" || tx.Action === "Payer") {
				realExpense += amount;
			}

			// Category Summary
			const catName = tx.CategoryName;
			if (catName) {
				if (!categorySummary[catName]) {
					categorySummary[catName] = {
						In: 0,
						Out: 0,
						Investment: 0,
						Credit: 0,
						Debit: 0,
						Buyer: 0,
						Payer: 0,
						Refund: 0,
						Return: 0,
						Installment: 0,
						From: 0,
						To: 0,
					};
				}
				if (categorySummary[catName][action] !== undefined) {
					categorySummary[catName][action] += amount;
				}
			}

			// Sub-Category Summary
			const subCatName = tx.SubCategoriesName;
			if (subCatName) {
				if (!subCategorySummary[subCatName]) {
					subCategorySummary[subCatName] = {
						In: 0,
						Out: 0,
						Investment: 0,
						Credit: 0,
						Debit: 0,
						Buyer: 0,
						Payer: 0,
						Refund: 0,
						Return: 0,
						Installment: 0,
						From: 0,
						To: 0,
					};
				}
				if (subCategorySummary[subCatName][action] !== undefined) {
					subCategorySummary[subCatName][action] += amount;
				}
			}

			// Party Summary
			const partyName = tx.PartyFirstName && tx.PartyLastName ? `${tx.PartyFirstName} ${tx.PartyLastName}` : null;
			if (partyName) {
				if (!partySummary[partyName]) {
					partySummary[partyName] = {
						Credit: 0,
						Debit: 0,
						Buyer: 0,
						Payer: 0,
						Refund: 0,
						Return: 0,
					};
				}
				if (partySummary[partyName][action] !== undefined) {
					partySummary[partyName][action] += amount;
				}
			}

			// Account Summary
			const accountName = tx.AccountName;
			if (accountName) {
				if (!accountSummary[accountName]) {
					accountSummary[accountName] = {
						In: 0,
						Out: 0,
						Investment: 0,
						Credit: 0,
						Debit: 0,
						Buyer: 0,
						Payer: 0,
						Refund: 0,
						Return: 0,
						Installment: 0,
						From: 0,
						To: 0,
					};
				}
				if (accountSummary[accountName][action] !== undefined) {
					accountSummary[accountName][action] += amount;
				}
			}

			// Action Summary
			if (!actionSummary[action]) {
				actionSummary[action] = 0;
			}
			actionSummary[action] += amount;

			// Daily Summary
			const dateKey = new Date(tx.Date).toISOString().split("T")[0];
			if (!dailySummary[dateKey]) {
				dailySummary[dateKey] = {
					date: dateKey,
					totalIn: 0,
					totalOut: 0,
					totalInvestment: 0,
					totalCredit: 0,
					totalDebit: 0,
					realIncome: 0,
					realExpense: 0,
					transactions: [],
				};
			}
			dailySummary[dateKey].transactions.push(tx);

			if (tx.Action === "In" || tx.Action === "Buyer" || tx.Action === "Refund") {
				dailySummary[dateKey].realIncome += amount;
			}
			if (tx.Action === "Out" || tx.Action === "Installment" || tx.Action === "Return" || tx.Action === "Payer") {
				dailySummary[dateKey].realExpense += amount;
			}
		});

		// Convert summaries to arrays
		const categorySummaryArray = Object.entries(categorySummary).map(([name, data]) => ({
			name,
			...data,
		}));

		const subCategorySummaryArray = Object.entries(subCategorySummary).map(([name, data]) => ({
			name,
			...data,
		}));

		const partySummaryArray = Object.entries(partySummary).map(([name, data]) => ({
			name,
			...data,
		}));

		const accountSummaryArray = Object.entries(accountSummary).map(([name, data]) => ({
			name,
			...data,
		}));

		const actionSummaryArray = Object.entries(actionSummary).map(([action, amount]) => ({
			action,
			amount,
		}));

		const dailySummaryArray = Object.values(dailySummary).sort((a, b) => a.date.localeCompare(b.date));

		// Calculate net amounts
		const netIncome = realIncome - realExpense;
		const netCredit = totalCredit - totalDebit;

		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
				data: {
					month: Month,
					year: Year,
					monthName: new Date(Year, Month - 1).toLocaleDateString("en-US", {month: "long"}),

					// Overall Summary
					summary: {
						totalIn,
						totalOut,
						totalInvestment,
						totalCredit,
						totalDebit,
						realIncome,
						realExpense,
						netIncome,
						netCredit,
					},

					// Detailed Breakdowns
					categorySummary: categorySummaryArray,
					subCategorySummary: subCategorySummaryArray,
					partySummary: partySummaryArray,
					accountSummary: accountSummaryArray,
					actionSummary: actionSummaryArray,
					dailySummary: dailySummaryArray,

					// All Transactions
					transactions: transactions.map((tx) => ({
						transactionId: tx.TransactionId,
						date: tx.Date,
						action: tx.Action,
						amount: tx.Amount,
						details: tx.Details,
						categoryName: tx.CategoryName,
						subCategoryName: tx.SubCategoriesName,
						accountName: tx.AccountName,
						partyName: tx.PartyFirstName && tx.PartyLastName ? `${tx.PartyFirstName} ${tx.PartyLastName}` : null,
						description: tx.Description,
					})),

					// Statistics
					statistics: {
						totalTransactions: transactions.length,
						uniqueCategories: Object.keys(categorySummary).length,
						uniqueSubCategories: Object.keys(subCategorySummary).length,
						uniqueParties: Object.keys(partySummary).length,
						uniqueAccounts: Object.keys(accountSummary).length,
						daysWithTransactions: Object.keys(dailySummary).length,
					},
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

// Account-Based Analytics Controllers

exports.AccountOverviewController = async (payloadUser, payloadBody) => {
	try {
		let {OrgId, BranchId, UserId} = payloadUser;
		let {Duration = "This_Year", AccountId} = payloadBody;

		const {StartDate, EndDate} = await durationFindFun(Duration);

		const whereCondition = {
			UsedBy: UserId,
			OrgId: OrgId,
			BranchId: BranchId,
			isDeleted: false,
			Date: {[Op.between]: [StartDate, EndDate]},
			...(AccountId && {AccountId}),
		};

		// Get account summary
		const accountSummary = await TransactionsModel.findAll({
			attributes: [
				[fn("SUM", literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), "totalIncome"],
				[fn("SUM", literal("CASE WHEN Action IN ('Out', 'Installment', 'Return') THEN Amount ELSE 0 END")), "totalExpense"],
				[fn("SUM", literal("CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END")), "totalInvestment"],
				[fn("COUNT", literal("CASE WHEN Action = 'In' THEN 1 END")), "incomeCount"],
				[fn("COUNT", literal("CASE WHEN Action IN ('Out', 'Installment', 'Return') THEN 1 END")), "expenseCount"],
				[fn("COUNT", literal("CASE WHEN Action = 'Investment' THEN 1 END")), "investmentCount"],
			],
			include: [
				{
					model: AccountsModel,
					attributes: ["AccountId", "AccountName", "TypeId", "CurrentAmount", "StartAmount", "MinAmount", "MaxAmount", "isActive", "isUsing", "createdAt", "Icon", "Color"],
				},
			],
			where: whereCondition,
			group: ["fn_account.AccountId"],
			order: [[fn("SUM", literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), "DESC"]],
			raw: true,
			nest: true,
		});

		// Get account performance by month
		const accountPerformance = await TransactionsModel.findAll({
			attributes: [
				[fn("YEAR", col("Date")), "year"],
				[fn("MONTH", col("Date")), "month"],
				[fn("MONTHNAME", col("Date")), "monthName"],
				[fn("SUM", literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), "income"],
				[fn("SUM", literal("CASE WHEN Action IN ('Out', 'Installment', 'Return') THEN Amount ELSE 0 END")), "expense"],
				[fn("SUM", literal("CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END")), "investment"],
			],
			where: whereCondition,
			// include: [
			// 	{
			// 		model: AccountsModel,
			// 		attributes: ["AccountId"],
			// 	},
			// ],
			group: [fn("YEAR", col("Date")), fn("MONTH", col("Date"))],
			order: [
				[fn("YEAR", col("Date")), "ASC"],
				[fn("MONTH", col("Date")), "ASC"],
			],
			raw: true,
		});

		// // Get recent transactions
		const recentTransactions = await TransactionsModel.findAll({
			attributes: ["TransactionId", "Action", "Amount", "Date", "Description"],
			include: [
				{
					model: CategoriesModel,
					attributes: ["CategoryName", "Icon", "Color"],
				},
				{
					model: AccountsModel,
					attributes: ["AccountName"],
				},
			],
			where: whereCondition,
			order: [["Date", "DESC"]],
			limit: 10,
			raw: true,
			nest: true,
		});

		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
				data: {
					accountSummary,
					accountPerformance,
					recentTransactions,
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

exports.AccountDetailsController = async (payloadUser, payloadBody) => {
	try {
		let {OrgId, BranchId, UserId} = payloadUser;
		let {AccountId, Duration = "This_Year"} = payloadBody;

		if (!AccountId) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "AccountId is required"},
			};
		}

		const {StartDate, EndDate} = await durationFindFun(Duration);

		const whereCondition = {
			UsedBy: UserId,
			OrgId: OrgId,
			BranchId: BranchId,
			isDeleted: false,
			Date: {[Op.between]: [StartDate, EndDate]},
			AccountId: AccountId,
		};

		// Get account details
		const accountDetails = await AccountsModel.findOne({
			where: {
				AccountId: AccountId,
				UsedBy: UserId,
				OrgId: OrgId,
				BranchId: BranchId,
				isDeleted: false,
			},
			raw: true,
		});

		// Get transaction summary
		const transactionSummary = await TransactionsModel.findOne({
			attributes: [
				[fn("SUM", literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), "totalIncome"],
				[fn("SUM", literal("CASE WHEN Action IN ('Out', 'Installment', 'Return') THEN Amount ELSE 0 END")), "totalExpense"],
				[fn("SUM", literal("CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END")), "totalInvestment"],
				[fn("COUNT", col("TransactionId")), "totalTransactions"],
			],
			where: whereCondition,
			raw: true,
		});

		// Get category breakdown
		const categoryBreakdown = await TransactionsModel.findAll({
			attributes: [
				[fn("SUM", literal("CASE WHEN Action = 'In' THEN Amount ELSE 0 END")), "income"],
				[fn("SUM", literal("CASE WHEN Action IN ('Out', 'Installment', 'Return') THEN Amount ELSE 0 END")), "expense"],
			],
			include: [
				{
					model: CategoriesModel,
					attributes: ["CategoryId", "CategoryName", "Icon", "Color"],
				},
			],
			where: whereCondition,
			// group: ["CategoryId"],
			order: [[fn("SUM", literal("CASE WHEN Action IN ('Out', 'Installment', 'Return') THEN Amount ELSE 0 END")), "DESC"]],
			raw: true,
			nest: true,
		});

		// Get daily balance history
		const balanceHistory = await TransactionsModel.findAll({
			attributes: [
				[fn("DATE", col("Date")), "date"],
				[fn("SUM", literal("CASE WHEN Action IN ('In', 'Credit', 'Buyer') THEN Amount ELSE -Amount END")), "balanceChange"],
			],
			where: whereCondition,
			group: [fn("DATE", col("Date"))],
			order: [[fn("DATE", col("Date")), "ASC"]],
			raw: true,
		});

		// Calculate running balance
		let runningBalance = parseFloat(accountDetails?.Balance || 0);
		const balanceWithRunning = balanceHistory.map((item) => {
			runningBalance += parseFloat(item.balanceChange || 0);
			return {
				...item,
				runningBalance: parseFloat(runningBalance.toFixed(2)),
			};
		});

		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
				data: {
					accountDetails,
					transactionSummary,
					categoryBreakdown,
					balanceHistory: balanceWithRunning,
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
