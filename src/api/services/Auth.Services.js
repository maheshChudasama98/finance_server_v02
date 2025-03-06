const { encrypt, decrypt } = require("../../helpers/Crypto");
const { DevelopMood } = require("../constants/constants");
const { getMessage } = require("../../helpers/messageLangSelector");
const AuthController = require("../controllers/Auth.controller");
const { SERVER_ERROR_CODE } = require("../constants/statusCode");

exports.LoginService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await AuthController.LoginController(body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage("EN", result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.ForgotPasswordService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await AuthController.ForgotPasswordController(body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage("EN", result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.ResetPasswordService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await AuthController.ResetPasswordController(body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage("EN", result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.UserRegistrationService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await AuthController.UserRegistrationController(body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage("EN", result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};