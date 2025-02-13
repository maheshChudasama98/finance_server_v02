const { encrypt, decrypt } = require("../../helpers/Crypto");
const { DevelopMood } = require("../constants/constants");
const { getMessage } = require("../../helpers/messageLangSelector");
const BranchController = require("../controllers/Branch.controller")

exports.FetchBrachListService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await BranchController.FetchBrachListController(body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == 501 ? result?.message : getMessage("EN", result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    })
};

exports.ModifyBranchService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await BranchController.ModifyBranchController(body, req.files, req.user);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == 501 ? result?.message : getMessage("EN", result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    })
};

exports.RemoveBranchService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await BranchController.RemoveBranchController(body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == 501 ? result?.message : getMessage("EN", result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    })
};