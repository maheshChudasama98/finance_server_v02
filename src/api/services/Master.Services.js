const { DevelopMood } = require("../constants/constants");
const { encrypt, decrypt } = require("../../helpers/Crypto");
const Controller = require("../controllers/Master.controller");
const { SERVER_ERROR_CODE } = require("../constants/statusCode");
const { getMessage } = require("../../helpers/messageLangSelector");

// ------------------------ || Categories Service || ------------------------ //

exports.CategoriesFetchListService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.CategoriesFetchListController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.CategoryModifyService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.CategoryModifyController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.CategoryActionService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.CategoryActionController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};


// ------------------------ || Sub-Categories Service || ------------------------ //

exports.SubCategoriesFetchListService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.SubCategoriesFetchListController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.SubCategoryModifyService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.SubCategoryModifyController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.SubCategoryActionService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.SubCategoryActionController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};


// ------------------------ || Labels Service || ------------------------ //

exports.LabelsFetchListService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.LabelsFetchListController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.LabelModifyService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.LabelModifyController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.LabelActionService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.LabelActionController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};


// ------------------------ || Accounts Service || ------------------------ //

exports.AccountsFetchListService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.AccountsFetchListController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.AccountModifyService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.AccountModifyController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.AccountActionService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.AccountActionController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};


// ------------------------ || Parties Service || ------------------------ //

exports.PartiesFetchListService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.PartiesFetchListController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.PartyModifyService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.PartyModifyController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.PartyActionService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.PartyActionController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};



// ------------------------ || Longs Service || ------------------------ //

exports.LongsFetchListService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.LongsFetchListController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.LongsModifyService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.LongsModifyController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};

exports.LongsActionService = async (req, res) => {

    const body = DevelopMood ? req.body : await decrypt(req.body?.key);
    const { httpCode, result } = await Controller.LongsActionController(req?.user, body);

    return res.status(httpCode).send({
        status: result?.status,
        message: httpCode == SERVER_ERROR_CODE ? result?.message : getMessage(req.user.Language, result?.message),
        data: DevelopMood ? result?.data : encrypt(result?.data)
    });
};