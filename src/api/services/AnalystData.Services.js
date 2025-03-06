const { encrypt, decrypt } = require("../../helpers/Crypto");
const { DevelopMood } = require("../constants/constants");
const { getMessage } = require("../../helpers/messageLangSelector");
const { SERVER_ERROR_CODE } = require("../constants/statusCode");
const Controller = require("../controllers/AnalystData.controller");

// ------------------------ || Service || ------------------------ //

exports.AccountService = async (req, res) => {
    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.AccountController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.TransactionFetchListService = async (req, res) => {
    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.TransactionFetchListController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};


exports.FinanceYearService = async (req, res) => {
    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.FinanceYearController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.SingleDataService = async (req, res) => {
    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.SingleDataController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.TopCategoriesService = async (req, res) => {
    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.TopCategoriesController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.TopSubCategoriesService = async (req, res) => {
    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.TopSubCategoriesController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};


exports.TopSubCategoriesService = async (req, res) => {
    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.TopSubCategoriesController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};


exports.DataFollService = async (req, res) => {
    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.DataFollController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};