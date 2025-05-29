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
				[fn("SUM", literal(`CASE WHEN Action = 'In' THEN Amount ELSE 0 END`)), "totalIn"],
				[fn("SUM", literal(`CASE WHEN Action = 'Out' THEN Amount ELSE 0 END`)), "totalOut"],
				[fn("SUM", literal(`CASE WHEN Action = 'Credit' THEN Amount ELSE 0 END`)), "totalCredit"],
				[fn("SUM", literal(`CASE WHEN Action = 'Debit' THEN Amount ELSE 0 END`)), "totalDebit"],
				[fn("SUM", literal(`CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END`)), "totalInvestment"],
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
				[fn("SUM", literal("CASE WHEN Action = 'Out' THEN Amount ELSE 0 END")), "totalOut"],
				[fn("SUM", literal("CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END")), "totalInvestment"],
				[fn("SUM", literal("CASE WHEN Action = 'Credit' THEN Amount ELSE 0 END")), "totalCredit"],
				[fn("SUM", literal("CASE WHEN Action = 'Debit' THEN Amount ELSE 0 END")), "totalDebit"],
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
				[fn("SUM", literal(`CASE WHEN Action = 'In' THEN Amount ELSE 0 END`)), "totalIn"],
				[fn("SUM", literal(`CASE WHEN Action = 'Out' THEN Amount ELSE 0 END`)), "totalOut"],
				[fn("SUM", literal(`CASE WHEN Action = 'Credit' THEN Amount ELSE 0 END`)), "totalCredit"],
				[fn("SUM", literal(`CASE WHEN Action = 'Debit' THEN Amount ELSE 0 END`)), "totalDebit"],
				[fn("SUM", literal(`CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END`)), "totalInvestment"],
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
				[fn("SUM", literal(`CASE WHEN Action = 'In' THEN Amount ELSE 0 END`)), "totalIn"],
				[fn("SUM", literal(`CASE WHEN Action = 'Out' THEN Amount ELSE 0 END`)), "totalOut"],
				[fn("SUM", literal(`CASE WHEN Action = 'Credit' THEN Amount ELSE 0 END`)), "totalCredit"],
				[fn("SUM", literal(`CASE WHEN Action = 'Debit' THEN Amount ELSE 0 END`)), "totalDebit"],
				[fn("SUM", literal(`CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END`)), "totalInvestment"],
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
				[fn("SUM", literal(`CASE WHEN Action = 'In' THEN Amount ELSE 0 END`)), "totalIn"],
				[fn("SUM", literal(`CASE WHEN Action = 'Out' THEN Amount ELSE 0 END`)), "totalOut"],
				[fn("SUM", literal(`CASE WHEN Action = 'Credit' THEN Amount ELSE 0 END`)), "totalCredit"],
				[fn("SUM", literal(`CASE WHEN Action = 'Debit' THEN Amount ELSE 0 END`)), "totalDebit"],
				[fn("SUM", literal(`CASE WHEN Action = 'Investment' THEN Amount ELSE 0 END`)), "totalInvestment"],
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
			const {StartDate, EndDate} = await durationFindFun("This_Year");
			whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		} else if (Duration === "WEEK") {
			timeDurationFn = fn("CONCAT", "Week-", fn("WEEK", col("Date")));
			const {StartDate, EndDate} = await durationFindFun("This_Year");
			whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		} else if (Duration === "MONTH") {
			timeDurationFn = fn("MONTHNAME", col("Date"));
			const {StartDate, EndDate} = await durationFindFun("This_Year");
			whereCondition.Date = {[Op.between]: [StartDate, EndDate]};
		} else if (Duration === "YEAR") {
			timeDurationFn = fn("YEAR", col("Date"));
			const {StartDate, EndDate} = await durationFindFun("All");
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
					"Action",
					"Date",
					"Amount",
					"AccountId",
					"CategoryId",
					"SubCategoryId",
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
				where: childWhereCondition,
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
