const jwt = require('jsonwebtoken');
require('dotenv').config();
const secureKey = process.env.TOKEN_SECURE_KEY;
const { decrypt } = require("../helpers/Crypto");
const { TOKEN_NOT_VALID_CODE, TOKEN_NOT_PROVIDED_CODE } = require("../api/constants/statusCode");
const { DevelopMood } = require("../api/constants/constants");

const db = require('../api/models');
const { Sequelize } = require('sequelize');
const UserModel = db.UserModel;
const OrgUsersModel = db.OrgUsersModel;


module.exports = async (req, res, next) => {
    const token = DevelopMood ? req.headers['authorization'] : await decrypt(req.headers['authorization']);

    if (token !== undefined) {
        jwt.verify(token, secureKey, async (err, decoded) => {

            if (err) {
                res.status(TOKEN_NOT_VALID_CODE).json({
                    status: false,
                    message: "Token is not valid!"
                })
                throw err;
            }
            else {
                UserModel.findByPk(decoded.UserId).then(async (data) => {
                    if (data) {

                        const userDetails = await OrgUsersModel.findOne({
                            attributes: [
                                "OrgUserId",
                                "OrgId",
                                "BranchId",
                                "UserId",
                                "RoleId",
                                "DefaultOrg",
                                [Sequelize.literal(`(SELECT RoleName FROM orgusers JOIN roles ON roles.RoleId = orgusers.RoleId LIMIT 1)`),"RoleName",]
                            ],
                            where: {
                                UserId: decoded.UserId,
                                DefaultOrg: true
                            },
                            raw: true
                        });

                        req.user = { ...data?.dataValues, ...userDetails };
                        next();
                        return;
                    };
                    res.status(TOKEN_NOT_PROVIDED_CODE).send({ status: false, message: 'Unauthorized!', });
                })
            }
        })
    }
    else {
        res.status(TOKEN_NOT_PROVIDED_CODE).json({ status: false, message: "No token provided!" })
    };
};