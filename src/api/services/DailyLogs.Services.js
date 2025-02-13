const { encrypt, decrypt } = require("../../helpers/Crypto");
const { DevelopMood } = require("../constants/constants");
const { getMessage } = require("../../helpers/messageLangSelector");
const Controller = require("../controllers/DailyLogs.controller");

exports.DailyLogModifyService = async (req, res) => {
    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.DailyLogModifyController(req.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == 501 ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    })
};

exports.FetchDailyLogListService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.FetchDailyLogListController(req.user);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == 501 ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    })
};

// exports.UserInfoService = async (req, res) => {

//     const { httpCode, result } = await Controller.UserInfoController(req?.user);

//     return res.status(httpCode).send({
//         status: result?.status,
//         message: httpCode == 501 ? result?.message : getMessage(req.user.Language, result?.message),
//         data: DevelopMood ? result?.data : encrypt(result?.data)
//     })
// };


