const { encrypt, decrypt } = require("../../helpers/Crypto");
const { DevelopMood } = require("../constants/constants");
const { getMessage } = require("../../helpers/messageLangSelector");
const Controller = require("../controllers/Org.controller");
const { SERVER_ERROR_CODE } = require("../constants/statusCode");

// ------------------------ || Org Service || ------------------------ //

exports.OrgModifyService = async (req, res) => {
    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.OrgModifyController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.OrgListService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.OrgListController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.OrgRemoveService = async (req, res) => {
    const { httpCode, result } = await Controller.OrgRemoveController(req?.user, req?.query);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.OrgActiveService = async (req, res) => {
    const { httpCode, result } = await Controller.OrgActiveController(req?.user, req?.query);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

// ------------------------ || Branch Service || ------------------------ //

exports.BranchModifyService = async (req, res) => {
    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.BranchModifyController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.BranchListService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.BranchListController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.BranchRemoveService = async (req, res) => {
    const { httpCode, result } = await Controller.BranchRemoveController(req?.user, req?.query);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.BranchActiveService = async (req, res) => {
    const { httpCode, result } = await Controller.BranchActiveController(req?.user, req?.query);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

// ------------------------ || Module Service || ------------------------ //

exports.ModuleModifyService = async (req, res) => {
    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.ModuleModifyController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.ModuleListService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.ModuleListController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.ModuleRemoveService = async (req, res) => {
    const { httpCode, result } = await Controller.ModuleRemoveController(req?.user, req?.query);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.ModuleActiveService = async (req, res) => {
    const { httpCode, result } = await Controller.ModuleActiveController(req?.user, req?.query);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

// ------------------------ || Roles Service || ------------------------ //

exports.RoleModifyService = async (req, res) => {
    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.RoleModifyController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.RoleListService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.RoleListController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.RoleRemoveService = async (req, res) => {
    const { httpCode, result } = await Controller.RoleRemoveController(req?.user, req?.query);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.RoleActiveService = async (req, res) => {
    const { httpCode, result } = await Controller.RoleActiveController(req?.user, req?.query);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};