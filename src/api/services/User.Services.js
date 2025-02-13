const { encrypt, decrypt } = require("../../helpers/Crypto");
const { DevelopMood } = require("../constants/constants");
const { getMessage } = require("../../helpers/messageLangSelector");
const UserController = require("../controllers/User.controller");

exports.UserInfoService = async (req, res) => {

    const { httpCode, result } = await UserController.UserInfoController(req?.user);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == 501 ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    })
};

exports.FetchUserListService = async (req, res) => {

    const { httpCode, result } = await UserController.FetchUserListController(req.user);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == 501 ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    })
};

exports.UserModifyService = async (req, res) => {

    const { httpCode, result } = await UserController.UserModifyController(req.user, req.body, req.files);

    return res.status(httpCode).send({
        status: result?.status,
        // message: result?.message,
        message: httpCode == 501 ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    })
};