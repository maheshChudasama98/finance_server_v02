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