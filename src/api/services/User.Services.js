const {encrypt, decrypt} = require("../../helpers/Crypto");
const {DevelopMood} = require("../constants/constants");
const {getMessage} = require("../../helpers/messageLangSelector");
const Controller = require("../controllers/User.controller");
const {SERVER_ERROR_CODE} = require("../constants/statusCode");

exports.UserInfoService = async (req, res) => {
	const {httpCode, result} = await Controller.UserInfoController(req?.user);

	return res.status(httpCode).send({
		status: result?.status,
		message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
		data: DevelopMood ? result?.data : encrypt(result?.data),
	});
};
exports.UserListService = async (req, res) => {
	const body = DevelopMood ? req.body : await decrypt(req.body?.key);
	const {httpCode, result} = await Controller.UserListController(req?.user, body);

	return res.status(httpCode).send({
		status: result?.status,
		message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
		data: DevelopMood ? result?.data : encrypt(result?.data),
	});
};

exports.UserModifyService = async (req, res) => {
	const body = DevelopMood ? req.body : await decrypt(req.body?.key);
	const {httpCode, result} = await Controller.UserModifyController(req?.user, body, req.files);

	return res.status(httpCode).send({
		status: result?.status,
		message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
		data: DevelopMood ? result?.data : encrypt(result?.data),
	});
};

exports.UserRemoveService = async (req, res) => {
	const {httpCode, result} = await Controller.UserRemoveController(req?.user, req?.query);

	return res.status(httpCode).send({
		status: result?.status,
		message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
		data: DevelopMood ? result?.data : encrypt(result?.data),
	});
};

exports.DefaultBrachService = async (req, res) => {
	const {httpCode, result} = await Controller.DefaultBrachController(req?.user, req?.query);

	return res.status(httpCode).send({
		status: result?.status,
		message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
		data: DevelopMood ? result?.data : encrypt(result?.data),
	});
};

exports.SettingGetService = async (req, res) => {
	const {httpCode, result} = await Controller.SettingGetController(req?.user);

	return res.status(httpCode).send({
		status: result?.status,
		message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
		data: DevelopMood ? result?.data : encrypt(result?.data),
	});
};

exports.SettingModifyService = async (req, res) => {
	const body = DevelopMood ? req.body : await decrypt(req.body?.key);
	const {httpCode, result} = await Controller.SettingModifyController(req?.user, body);

	return res.status(httpCode).send({
		status: result?.status,
		message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
		data: DevelopMood ? result?.data : encrypt(result?.data),
	});
};
