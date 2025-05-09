require("dotenv").config();
// const PDFDocument = require("pdfkit");
const PDFDocument = require("pdfkit-table");
const path = require("path");
const moment = require("moment");
const {decode} = require("entities");

const fs = require("fs");
const {emailHelper} = require("./Email.helper");
const {durationFindFun} = require("./Actions.helper");

const db = require("../api/models/index");
const {Sequelize, Op} = require("sequelize");
const OrgUsersModel = db.OrgUsersModel;
const UserModel = db.UserModel;
const TransactionsModel = db.TransactionsModel;
const AccountsModel = db.AccountsModel;
const CategoriesModel = db.CategoriesModel;
const SubCategoriesModel = db.SubCategoriesModel;
const PartiesModel = db.PartiesModel;
const EmailsmsModel = db.EmailsmsModel;

async function createTransactionStatement() {
	const {StartDate, EndDate} = await durationFindFun("Last_Month");

	const UserList = await OrgUsersModel.findAll({
		attributes: [
			"OrgId",
			"BranchId",
			"UserId",
			[Sequelize.col("user.UUID"), "UUID"],
			[Sequelize.col("user.FirstName"), "FirstName"],
			[Sequelize.col("user.LastName"), "LastName"],
			[Sequelize.col("user.Email"), "Email"],
		],
		where: {
			isDeleted: false,
		},
		include: [
			{
				model: UserModel,
				required: true,
				attributes: [],
			},
		],
		raw: true,
	});

	const findMail = await EmailsmsModel.findOne({
		where: {Slug: "monthly-transaction-summary"},
		raw: true,
	});

	let whereCondition = {
		isDeleted: false,
		Action: {[Op.not]: "To"},
		Date: {[Op.between]: [StartDate, EndDate]},
	};

	for (let index = 0; index < UserList.length; index++) {
		const element = UserList[index];
		whereCondition.OrgId = element.OrgId;
		whereCondition.BranchId = element.BranchId;
		whereCondition.UsedBy = element.UserId;

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
			order: [["Date", "ASC"]],
			raw: true,
		});

		if (fetchList.length > 0) {
			let totalIn = 0;
			let totalOut = 0;
			let totalInvestment = 0;
			let totalCredit = 0;
			let totalDebit = 0;

			fetchList.forEach((tx) => {
				const amount = parseFloat(tx.Amount) || 0;

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
			});

			// const groupedByDate = fetchList.reduce((acc, item) => {
			// 	let dateGroup = acc.find((group) => group.date === item.Date);

			// 	if (!dateGroup) {
			// 		dateGroup = {date: item.Date, totalIn: 0, totalOut: 0, dayTotal: 0, records: []};
			// 		acc.push(dateGroup);
			// 	}

			// 	const amount = parseFloat(item.Amount);
			// 	if (item.Action === "In") {
			// 		dateGroup.totalIn += amount;
			// 	} else if (item.Action === "Out") {
			// 		dateGroup.totalOut += amount;
			// 	}

			// 	dateGroup.dayTotal = dateGroup.totalIn - dateGroup.totalOut;
			// 	dateGroup.records.push(item);
			// 	return acc;
			// }, []);

			const dirPath = path.join(__dirname, "../../public", "statement", element.UUID);
			let fileName = `${moment().subtract(1, "months").format("MMM_YYYY")}.pdf`;
			const currentMonth = moment().subtract(1, "months").format("MMM YYYY");

			const pdfPath = path.join(dirPath, fileName);

			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, {recursive: true});
			}

			let doc = new PDFDocument({margin: 20, size: "A4"});
			doc.pipe(fs.createWriteStream(pdfPath));

			// --- First Page Header ---
			doc.fontSize(18).text("FV2", {align: "center"});
			doc.moveDown(0.5);
			doc.fontSize(11).text("Transaction Statement " + currentMonth, {align: "center"});
			doc.moveDown();

			const tableDetails = {
				headers: [
					{
						label: "Month Over View",
						property: "Action",
						width: 125,
					},
					{
						label: "",
						property: "Amount",
						width: 125,
						align: "right",
						renderer: (value, indexColumn, indexRow, row) => {
							return `${Number(value).toFixed(2)}`;
						},
					},
				],

				rows: [
					["Income", totalIn],
					["Expense", totalOut],
					["Investment", totalInvestment],
					["Credit", totalCredit],
					["Debit", totalDebit],
				],
			};

			doc.table(tableDetails, {
				width: 250,
				padding: 2,

				hideHeader: true,
				prepareHeader: () => {
					doc.font("Helvetica-Bold").fontSize(10);
				},
				prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
					if (indexColumn === 0) {
						doc.font("Helvetica-Bold").fontSize(9); // Bold only the first row
					} else {
						doc.font("Helvetica").fontSize(9);
					}
				},
			});

			doc.moveDown();

			const table = {
				headers: [
					{
						label: "Date",
						property: "Date",
						width: 60,
						renderer: (value, indexColumn, indexRow, row) => {
							return moment(value).format("DD MMM");
						},
					},
					{label: "SubCategory", property: "SubCategory", width: 120, renderer: null},
					{label: "Action", property: "Action", width: 100, renderer: null},

					{label: "Account", property: "Account", width: 100, renderer: null},
					{label: "Transfer / Party ", property: "TransferAccount", width: 100, renderer: null},
					// {label: "", property: "PartyName", width: 90, renderer: null},
					{
						label: "Amount",
						property: "Amount",
						width: 75,
						align: "right",
						renderer: (value, indexColumn, indexRow, row) => {
							return `${Number(value).toFixed(2)}`;
						},
					},
				],

				rows: fetchList.map((r) => [
					r?.Date,
					r?.SubCategoryDetails?.SubCategoriesName || "",
					r?.Action == "From" ? "Transfer" : r?.Action,
					r?.AccountDetails?.AccountName || "",
					r?.TransferDetails?.AccountName || r?.PartyDetails?.FullName || "",
					r?.AccountAmount,
				]),
			};

			doc.table(table, {
				width: 540,
				padding: 3,
				prepareHeader: () => {
					doc.font("Helvetica-Bold").fontSize(10);
				},
				prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
					doc.font("Helvetica").fontSize(9);
				},
			});

			doc.moveDown();

			doc.end();

			let decodeContent = decode(findMail.Content);
			let decodeTitle = decode(findMail.Title);

			const emailContent = decodeContent
				.replace(/\{__UserName__}/g, element?.FirstName)
				.replace(/\{__MonthYear__}/g, currentMonth)
				.replace(/\{__Income__}/g, totalIn)
				.replace(/\{__Expense__}/g, totalOut)
				.replace(/\{__Investment__}/g, totalInvestment)
				.replace(/\{__Credit__}/g, totalCredit)
				.replace(/\{__Debit__}/g, totalDebit);

			const Title = decodeTitle.replace(/\{__MonthYear__}/g, currentMonth);

			emailHelper(emailContent, findMail.Subject, Title, element?.Email, [
				{
					filename: fileName,
					path: pdfPath,
				},
			]);
		}
	}
}

module.exports = {createTransactionStatement};
