const {Op, Sequelize} = require("sequelize");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {v4: uuidv4} = require("uuid");
const {decode} = require("entities");

const emailActions = require("../../helpers/Email.helper");
const {ProjectName} = require("../constants/constants");
const {SUCCESS_CODE, BAD_REQUEST_CODE, SERVER_ERROR_CODE} = require("../constants/statusCode");

const secureKey = process.env.TOKEN_SECURE_KEY;

const db = require("../models");
const {defaultOrgSetAction} = require("../../helpers/Actions.helper");
const UserModel = db.UserModel;
const OrgUsersModel = db.OrgUsersModel;

exports.LoginController = async (payloadBody) => {
	try {
		const {UserEmail, UserPassword} = payloadBody;

		if (!UserEmail || !UserPassword) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {
					status: false,
					message: "BAD_REQUEST_CODE",
				},
			};
		} else {
			let TargetUser = {};

			TargetUser = await OrgUsersModel.findOne({
				attributes: [
					"OrgId",
					"BranchId",
					[Sequelize.col("user.UUID"), "UUID"],
					[Sequelize.col("user.UserId"), "UserId"],
					[Sequelize.col("user.Password"), "Password"],
					[Sequelize.col("user.FirstName"), "FirstName"],
					[Sequelize.col("user.LastName"), "LastName"],
					[Sequelize.col("user.Email"), "Email"],
					[Sequelize.col("user.Mobile"), "Mobile"],
					[Sequelize.col("user.createdAt"), "createdAt"],
				],
				include: [
					{
						model: UserModel,
						attributes: [],
						require: true,
						where: {
							isActive: true,
							isDeleted: false,
							Email: UserEmail,
						},
					},
				],
				where: {
					DefaultOrg: true,
					isActive: true,
					isDeleted: false,
				},
				raw: true,
			});

			if (!TargetUser?.UserId) {
				const User = await UserModel.findOne({
					where: {
						isActive: true,
						isDeleted: false,
						Email: UserEmail,
					},
					raw: true,
				});

				if (!User?.UserId) {
					return {
						httpCode: SUCCESS_CODE,
						result: {
							status: false,
							message: "USER_NOT_VALID",
						},
					};
				} else {
					TargetUser = await OrgUsersModel.findOne({
						where: {
							UserId: User?.UserId,
							isActive: true,
							isDeleted: false,
						},
						include: [
							{
								model: UserModel,
								attributes: [],
								require: true,
								where: {
									isActive: true,
									isDeleted: false,
									Email: UserEmail,
								},
							},
						],
						attributes: [
							"OrgId",
							"BranchId",
							"OrgUserId",
							[Sequelize.col("user.UUID"), "UUID"],
							[Sequelize.col("user.UserId"), "UserId"],
							[Sequelize.col("user.Password"), "Password"],
							[Sequelize.col("user.FirstName"), "FirstName"],
							[Sequelize.col("user.LastName"), "LastName"],
							[Sequelize.col("user.Email"), "Email"],
							[Sequelize.col("user.Mobile"), "Mobile"],
							[Sequelize.col("user.createdAt"), "createdAt"],
						],
						raw: true,
					});

					if (!TargetUser?.UserId) {
						return {
							httpCode: SUCCESS_CODE,
							result: {
								status: false,
								message: "USER_NOT_VALID",
							},
						};
					} else {
						await defaultOrgSetAction(TargetUser?.UserId, TargetUser?.BranchId);
					}
				}
			}

			const passwordMatch = await new Promise((resolve, reject) => {
				bcrypt.compare(UserPassword, TargetUser?.Password, (err, result) => {
					if (err) reject(err);
					resolve(result);
				});
			});

			if (!passwordMatch) {
				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: false,
						message: "PASSWORD_NOT_VALID",
					},
				};
			}

			const tokenPassObj = {
				UserId: TargetUser.UserId,
				UserFullName: `${TargetUser.FirstName} ${TargetUser.LastName}`,
				UserEmail: TargetUser.Email,
				UUID: TargetUser.UUID,
				createdAt: TargetUser.createdAt,
			};

			const token = await new Promise((resolve, reject) => {
				jwt.sign(tokenPassObj, secureKey, {expiresIn: "24h"}, (err, tokenValue) => {
					if (err) reject(err);
					resolve(tokenValue);
				});
			});

			return {
				httpCode: SUCCESS_CODE,
				result: {
					status: true,
					message: "LOGIN_SUCCESS",
					data: token,
				},
			};
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};

exports.SignupController = async (payloadBody) => {
	try {
		const {UserFirstName, UserLastName, UserEmail, UserPassword} = payloadBody;

		if (!UserFirstName || !UserLastName || !UserEmail || !UserPassword) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {
					status: false,
					message: "BAD_REQUEST_CODE",
				},
			};
		} else {
			const FindDuplicateUser = await UserModel.findOne({
				where: {
					Email: UserEmail?.trim(),
					isDeleted: false,
				},
				raw: true,
			});

			if (!FindDuplicateUser) {
				const uuid = uuidv4();

				const registeredUser = await UserModel.create({
					UUID: uuid,
					FirstName: UserFirstName?.trim(),
					LastName: UserLastName?.trim(),
					AvatarName: UserFirstName?.[0] + UserLastName?.[0],
					Email: UserEmail?.trim() || null,
					Password: bcrypt.hashSync(UserPassword?.trim(), 10),
					createdAt: new Date(),
					updatedAt: new Date(),
				});

				OrgUsersModel.create({
					OrgId: 1,
					BranchId: 1,
					UserId: registeredUser?.UserId,
					RoleId: 4,
					DefaultOrg: true,
				});

				const tokenPassObj = {
					UserId: registeredUser.UserId,
					UserFullName: `${registeredUser.FirstName} ${registeredUser.LastName}`,
					UserEmail: registeredUser.Email,
					UUID: registeredUser.UUID,
					createdAt: registeredUser.createdAt,
				};

				const token = await new Promise((resolve, reject) => {
					jwt.sign(tokenPassObj, secureKey, {expiresIn: "24h"}, (err, tokenValue) => {
						if (err) reject(err);
						resolve(tokenValue);
					});
				});
				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: true,
						message: "USER_REGISTERED_SUCCESS",
						data: token,
					},
				};
			} else {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "USER_ALREADY_REGISTERED"},
				};
			}
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};

exports.ForgotPasswordController = async (payloadBody) => {
	try {
		const {UserEmail} = payloadBody;

		if (!(UserEmail != null || UserEmail != undefined)) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		const TargetUser = await UserModel.findOne({
			where: {
				Email: UserEmail,
				isDeleted: false,
			},
			raw: true,
		});

		if (TargetUser?.UserId) {
			const min = 100000;
			const max = 999999;
			const optNumber = Math.floor(Math.random() * (max - min + 1)) + min;

			const findMail = await db.EmailsmsModel.findOne({
				where: {Slug: "otp-verification"},
				raw: true,
			});

			let decodeContent = decode(findMail.Content);

			const emailContent = decodeContent.replace(/\{__UserName__}/g, TargetUser?.FirstName + TargetUser?.LastName).replace(/\{__OTP__}/g, optNumber);

			await emailActions.emailHelper(emailContent, findMail.Subject, findMail.Title, TargetUser?.Email);

			const UpdateUser = await new Promise(async (resolve, reject) => {
				await UserModel.update({AuthOpt: optNumber}, {where: {UserId: TargetUser.UserId}})
					.then(async (response) => {
						resolve(true);
					})
					.catch((error) => {
						console.log(`\x1b[91m ${error} \x1b[91m`);
						if (error) reject(error);
					});
			});

			if (UpdateUser) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "EMAIL_OPT"},
				};
			} else {
				return {
					httpCode: SERVER_ERROR_CODE,
					result: {status: false, message: UpdateUser},
				};
			}
		} else {
			return {
				httpCode: SUCCESS_CODE,
				result: {status: false, message: "USER_NOT_VALID"},
			};
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};

exports.ResetPasswordController = async (payloadBody) => {
	try {
		const {UserEmail, UserNumber, UserPassword, OptNum, OldPassword} = payloadBody;

		if ((!UserEmail && !UserNumber) || (!OptNum && !OldPassword) || !UserPassword) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		const TargetUser = await UserModel.findOne({
			where: {
				[Op.or]: [{Email: UserEmail || ""}, {Mobile: UserNumber || ""}],
				isDeleted: false,
			},
			raw: true,
		});

		if (TargetUser?.AuthOpt && TargetUser?.UserId) {
			const matchFindOpt = await UserModel.findOne({
				where: {
					UserId: TargetUser.UserId,
					AuthOpt: OptNum,
				},
				raw: true,
			});

			if (matchFindOpt?.UserId) {
				const UpdateUser = await new Promise(async (resolve, reject) => {
					await UserModel.update(
						{
							AuthOpt: null,
							Password: bcrypt.hashSync(UserPassword, 10),
						},
						{where: {UserId: matchFindOpt.UserId}}
					)
						.then(async (response) => {
							resolve(true);
						})
						.catch((error) => {
							console.log(`\x1b[91m ${error} \x1b[91m`);
							if (error) reject(error);
						});
				});

				if (UpdateUser) {
					return {
						httpCode: SUCCESS_CODE,
						result: {status: true, message: "CHANGE_PASSWORD"},
					};
				} else {
					return {
						httpCode: SERVER_ERROR_CODE,
						result: {status: false, message: UpdateUser},
					};
				}
			} else {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "OTP_NOT_MATCH"},
				};
			}
		} else if (OldPassword && TargetUser?.UserId) {
			const passwordMatch = await new Promise((resolve, reject) => {
				bcrypt.compare(OldPassword, TargetUser?.Password, (err, result) => {
					if (err) reject(err);
					resolve(result);
				});
			});

			if (!passwordMatch) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "CURRENT_PASSWORD_NOT_VALID"},
				};
			}

			const UpdateUser = await new Promise(async (resolve, reject) => {
				await UserModel.update(
					{
						AuthOpt: null,
						Password: bcrypt.hashSync(UserPassword, 10),
					},
					{where: {UserId: TargetUser.UserId}}
				)
					.then(async (response) => {
						resolve(true);
					})
					.catch((error) => {
						console.log(`\x1b[91m ${error} \x1b[91m`);
						if (error) reject(error);
					});
			});

			if (UpdateUser) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "CHANGE_PASSWORD"},
				};
			}
		} else {
			return {
				httpCode: SUCCESS_CODE,
				result: {status: false, message: "USER_NOT_VALID"},
			};
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};

exports.UserRegistrationController = async (payloadBody) => {
	try {
		const {UserFirstName, UserLastName, UserEmail, UserPassword, UserNumber} = payloadBody;

		if (!UserFirstName || !UserLastName || !UserEmail || !UserPassword) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {
					status: false,
					message: "BAD_REQUEST_CODE",
				},
			};
		} else {
			const FindDuplicateUser = await UserModel.findOne({
				where: {
					[Op.or]: [{Email: UserEmail?.trim() || ""}],
					isDeleted: false,
				},
				raw: true,
			});

			if (!FindDuplicateUser) {
				const uuid = uuidv4();

				const registeredUser = await UserModel.create({
					UUID: uuid,
					FirstName: UserFirstName?.trim(),
					LastName: UserLastName?.trim(),
					AvatarName: UserFirstName?.[0] + UserLastName?.[0],
					Email: UserEmail?.trim() || null,
					Mobile: UserNumber || null,
					Password: bcrypt.hashSync(UserPassword?.trim(), 10),
					createdAt: new Date(),
					updatedAt: new Date(),
				});

				const emailDetails = {
					to: UserEmail,
					subject: `Welcome to ${ProjectName} Registration Successful`,
					description: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
                                    <h2>Dear ${UserFirstName + " " + UserLastName}</h2>
                                    <p>Welcome to <strong>${ProjectName} </strong>!</p>
                                    <p>We are excited to have you on board. Your registration has been successfully completed. Here are your login details:</p>
                                    ${UserEmail ? `<p><strong>Email:</strong> ${UserEmail}</p>` : ""}
                                    ${UserNumber ? `<p><strong>Mobile:</strong> ${UserNumber}</p>` : ""}
                                    <p>Please keep this information secure and do not share it with anyone. You can now log in to your account using the following link: <a href="[Login URL]">Login</a>.</p>
                                    <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
                                    <p>Thank you for choosing <strong>${ProjectName} </strong>. We're glad to have you with us!</p>
                                    <p>Best regards,</p>
                                    <p>${ProjectName} Team</p>
                                    </div>`,
				};

				OrgUsersModel.create({
					OrgId: 1,
					BranchId: 1,
					UserId: registeredUser?.UserId,
					RoleId: 1,
					DefaultOrg: true,
				});

				await emailActions.emailFormat(emailDetails);

				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: true,
						message: "USER_REGISTERED_SUCCESS",
					},
				};
			} else {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "USER_ALREADY_REGISTERED"},
				};
			}
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};
