const {encrypt, decrypt} = require("../../helpers/Crypto");
const {DevelopMood} = require("../constants/constants");
const {getMessage} = require("../../helpers/messageLangSelector");
const {SERVER_ERROR_CODE} = require("../constants/statusCode");
const Controller = require("../controllers/AnalystData.controller");

// ------------------------ || Service || ------------------------ //

exports.DashboardService = async (req, res) => {
	const body = DevelopMood ? req.body : await decrypt(req.body?.key);
	const {httpCode, result} = await Controller.DashboardController(req?.user, body);

	return res.status(httpCode).send({
		status: result?.status,
		message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
		data: DevelopMood ? result?.data : encrypt(result?.data),
	});
};

exports.BalanceOverviewService = async (req, res) => {
	const body = DevelopMood ? req.body : await decrypt(req.body?.key);
	const {httpCode, result} = await Controller.BalanceOverviewController(req?.user, body);

	return res.status(httpCode).send({
		status: result?.status,
		message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
		data: DevelopMood ? result?.data : encrypt(result?.data),
	});
};

exports.TopCategoriesService = async (req, res) => {
	const body = DevelopMood ? req.body : await decrypt(req.body?.key);
	const {httpCode, result} = await Controller.TopCategoriesController(req?.user, body);

	return res.status(httpCode).send({
		status: result?.status,
		message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
		data: DevelopMood ? result?.data : encrypt(result?.data),
	});
};

exports.TopSubCategoriesService = async (req, res) => {
	const body = DevelopMood ? req.body : await decrypt(req.body?.key);
	const {httpCode, result} = await Controller.TopSubCategoriesController(req?.user, body);

	return res.status(httpCode).send({
		status: result?.status,
		message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
		data: DevelopMood ? result?.data : encrypt(result?.data),
	});
};

exports.RecodeListService = async (req, res) => {
	const body = DevelopMood ? req.body : await decrypt(req.body?.key);
	const {httpCode, result} = await Controller.RecodeListController(req?.user, body);

	return res.status(httpCode).send({
		status: result?.status,
		message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
		data: DevelopMood ? result?.data : encrypt(result?.data),
	});
};

exports.BalanceFollService = async (req, res) => {
	const body = DevelopMood ? req.body : await decrypt(req.body?.key);
	const {httpCode, result} = await Controller.BalanceFollController(req?.user, body);

	return res.status(httpCode).send({
		status: result?.status,
		message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
		data: DevelopMood ? result?.data : encrypt(result?.data),
	});
};

exports.PerformanceService = async (req, res) => {
	const body = DevelopMood ? req.body : await decrypt(req.body?.key);
	const {httpCode, result} = await Controller.PerformanceController(req?.user, body);

	return res.status(httpCode).send({
		status: result?.status,
		message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
		data: DevelopMood ? result?.data : encrypt(result?.data),
	});
};