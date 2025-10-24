const {Op, Sequelize, UUID, where} = require("sequelize");
const {SUCCESS_CODE, SERVER_ERROR_CODE, BAD_REQUEST_CODE} = require("../constants/statusCode");
const bcrypt = require("bcrypt");
const {v4: uuidv4} = require("uuid");

const {getPagination, generatePassword, defaultOrgSetAction} = require("../../helpers/Actions.helper");

const db = require("../models/index");
const {FileUpload} = require("../../helpers/FileUpload.helper");
const {UserProfileImagePath, superAdminRoleId, OrgImagePath, BranchImagePath} = require("../constants/constants");
const {registrationUser} = require("../../helpers/Email.helper");
const {UserBasedDefaultCategory} = require("./Basic.controller");
const UserModel = db.UserModel;
const OrgUsersModel = db.OrgUsersModel;
const ModulesModel = db.ModulesModel;
const PermissionModel = db.PermissionModel;
const SettingModel = db.SettingModel;

exports.UserInfoController = async (payloadUser) => {
	try {
		const {UserId} = payloadUser;

		const UserDetails = await OrgUsersModel.findOne({
			attributes: [
				"OrgUserId",
				"OrgId",
				"BranchId",
				"UserId",
				"RoleId",
				"DefaultOrg",
				[
					Sequelize.literal(`(
                      SELECT JSON_ARRAYAGG(
                          JSON_OBJECT(
                              'OrgId', orgs.OrgId,
                              'OrgName', orgs.OrgName,
                              'Description', orgs.Description,
                              'UUID', orgs.UUID,
                              'ImgPath', CASE WHEN orgs.ImgPath IS NOT NULL THEN CONCAT('${OrgImagePath}','/', orgs.UUID, '/', orgs.ImgPath) ELSE NULL END,
                              'createdAt', orgs.createdAt
                          )
                      )
                      FROM orgs
                      WHERE 
                      orgs.isDeleted = false AND orgs.isActive = true
                      AND orgs.OrgId IN ( SELECT OrgId FROM orgusers WHERE orgusers.UserId = ${UserId} )
                  )`),
					"OrgsList",
				],
				[
					Sequelize.literal(`(
                      SELECT 
                          JSON_OBJECT(
                              'OrgId', orgs.OrgId,
                              'OrgName', orgs.OrgName,
                              'Description', orgs.Description,
                              'UUID', orgs.UUID,
                              'ImgPath', CASE WHEN orgs.ImgPath IS NOT NULL THEN CONCAT('${OrgImagePath}','/', orgs.UUID, '/', orgs.ImgPath) ELSE NULL END,
                              'createdAt', orgs.createdAt
                      )
                      FROM orgs
                      WHERE  orgs.isDeleted = false AND orgs.isActive = true
                      AND orgs.OrgId = ( 
                          SELECT OrgId 
                          FROM orgusers 
                          WHERE orgusers.UserId = ${UserId} 
                          AND orgusers.DefaultOrg = true 
                          LIMIT 1
                      )
                  )`),
					"SelectOrg",
				],
				[
					Sequelize.literal(`(
                      SELECT JSON_ARRAYAGG(
                          JSON_OBJECT(
                              'BranchId', branches.BranchId,
                              'BranchName', branches.BranchName,
                              'Description', branches.Description,
                              'UUID', branches.UUID,
                              'Address', branches.Address,
                              'City', branches.City,
                              'GstNumber', branches.GstNumber,
                              'Phone', branches.Phone,
                              'Email', branches.Email,
                              'ImgPath', CASE WHEN branches.ImgPath IS NOT NULL THEN CONCAT('${BranchImagePath}','/', branches.UUID, '/', branches.ImgPath) ELSE NULL END,
                              'createdAt', branches.createdAt
                          )
                      )
                      FROM branches
                      WHERE branches.BranchId IN (
                              SELECT BranchId 
                              FROM orgusers 
                              WHERE orgusers.UserId = ${UserId} 
                              AND orgusers.OrgId = orgusers.OrgId
                          )
                  )`),
					"BranchesList",
				],
				[
					Sequelize.literal(`(
                      SELECT JSON_OBJECT(
                              'OrgUserId', orgusers.OrgUserId,
                              'BranchId', branches.BranchId,
                              'BranchName', branches.BranchName,
                              'Description', branches.Description,
                              'UUID', branches.UUID,
                              'Address', branches.Address,
                              'City', branches.City,
                              'GstNumber', branches.GstNumber,
                              'Phone', branches.Phone,
                              'Email', branches.Email,
                              'ImgPath', CASE WHEN branches.ImgPath IS NOT NULL THEN CONCAT('${BranchImagePath}','/', branches.UUID, '/', branches.ImgPath) ELSE NULL END,
                              'createdAt', branches.createdAt
                          )
                      FROM branches
                      WHERE branches.BranchId = (
                              SELECT BranchId 
                              FROM orgusers 
                              WHERE orgusers.UserId = ${UserId} 
                              AND orgusers.OrgId = orgusers.OrgId
                              AND orgusers.DefaultOrg = true 
                              LIMIT 1
                          )
                  )`),
					"SelectBranch",
				],
			],
			where: {
				UserId: UserId,
				DefaultOrg: true,
			},
			raw: true,
		});

		const PermissionList = await PermissionModel.findAll({
			attributes: [
				"PermissionId",
				"ModuleId",
				"RoleId",
				"CanRead",
				"CanWrite",
				[Sequelize.col("module.ModulesName"), "ModulesName"],
				[Sequelize.col("module.Icon"), "Icon"],
				[Sequelize.col("module.Router"), "Router"],
				[Sequelize.col("module.isActive"), "isMobile"],
			],
			where: {RoleId: UserDetails?.RoleId},
			include: [
				{
					model: ModulesModel,
					attributes: [],
				},
			],
			raw: true,
		});

		const UserInfo = await UserModel.findOne({
			where: {
				UserId: UserId,
			},
			attributes: [
				"UserId",
				"FirstName",
				"LastName",
				"AvatarName",
				"Email",
				"Mobile",
				"ImgPath",
				"Language",
				[Sequelize.col("setting.DefaultTimeFrame"), "DefaultTimeFrame"],
				[Sequelize.col("setting.DefaultDuration"), "DefaultDuration"],
				[Sequelize.col("setting.DefaultDateFormat"), "DefaultDateFormat"],
				[Sequelize.col("setting.DefaultCurrency"), "DefaultCurrency"],
				[Sequelize.col("setting.AmountHide"), "AmountHide"],
				[Sequelize.col("setting.ThemeMode"), "ThemeMode"],
				[Sequelize.col("setting.ThemePrimary"), "ThemePrimary"],
				[Sequelize.literal("CONCAT(FirstName, ' ', LastName)"), "FullName"],
				[Sequelize.literal(`CASE  WHEN ImgPath IS NOT NULL THEN CONCAT('${UserProfileImagePath}','/', UUID, '/', ImgPath)  ELSE NULL  END`), "ImgPath"],
				[
					Sequelize.literal(`(
                      SELECT JSON_ARRAYAGG(
                          JSON_OBJECT(
                              'OrgUserId', orgusers.OrgUserId,
                              'BranchId', orgusers.BranchId,
							  'OrgName', orgs.OrgName,
							  'BranchName', branches.BranchName
                          )
                      )
                      FROM orgusers 
					  JOIN orgs ON orgs.OrgId = orgusers.OrgId
					  JOIN branches ON branches.BranchId = orgusers.BranchId
					  WHERE orgusers.UserId = users.UserId 
                  )`),
					"BranchesList",
				],
			],
			include: [
				{
					model: SettingModel,
					attributes: [],
				},
			],
			raw: true,
		});

		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
				data: {
					Branch: {
						BranchesList: UserDetails?.BranchesList,
						SelectBranch: UserDetails?.SelectBranch,
					},
					Org: {
						OrgsList: UserDetails?.OrgsList,
						SelectOrg: UserDetails?.SelectOrg,
					},
					PermissionList,
					UserInfo: UserInfo,
				},
			},
		};
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {status: false, message: error.message},
		};
	}
};

exports.UserListController = async (payloadUser, payloadBody) => {
	try {
		const {OrgId, BranchId, UserId, RoleId} = payloadUser;
		const {Action, Page, PageSize, FilterBy, SearchKey} = payloadBody;

		console.log(payloadUser, "payloadUser");

		if (Action) {
			if (!Page || !PageSize) {
				return {
					httpCode: BAD_REQUEST_CODE,
					result: {
						status: false,
						message: "BAD_REQUEST_CODE",
					},
				};
			}

			var {limit, offset} = getPagination(Page, PageSize);
		}

		const whereCondition = {
			isDeleted: false,
			[Op.or]: [{"$orgusers.OrgId$": {[Op.eq]: OrgId}}, {"$orgusers.BranchId$": {[Op.eq]: BranchId}}],
		};

		const fetchList = await UserModel.findAll({
			attributes: [
				"UserId",
				"FirstName",
				"LastName",
				"AvatarName",
				"Email",
				"Mobile",
				"Language",
				"isActive",
				"createdAt",
				[Sequelize.literal("CONCAT(FirstName, ' ', LastName)"), "FullName"],
				[Sequelize.literal(`CASE  WHEN ImgPath IS NOT NULL THEN CONCAT('${UserProfileImagePath}','/', UUID, '/', ImgPath)  ELSE NULL  END`), "ImgPath"],
				[
					Sequelize.literal(`(
              			SELECT r.RoleName  FROM roles r 
              			JOIN orgusers ou ON ou.RoleId = r.RoleId 
              			WHERE ou.OrgId = ${OrgId} 
              			AND ou.BranchId = ${BranchId}
              			AND ou.UserId = users.UserId
              			LIMIT 1
            		)`),
					"RoleName",
				],
				[
					Sequelize.literal(`(
						SELECT r.RoleId  FROM roles r 
                		JOIN orgusers ou ON ou.RoleId = r.RoleId 
                		WHERE ou.OrgId = ${OrgId} 
                		AND ou.BranchId = ${BranchId}
                		AND ou.UserId = users.UserId
                		LIMIT 1
              			)`),
					"RoleId",
				],
			],
			include: [
				{
					model: OrgUsersModel,
				},
			],
			group: ["UserId"],
			where: whereCondition,
			raw: true,
		});

		if (Action) {
			const totalCount = await UserModel.count({
				where: whereCondition,
				distinct: true,
				subQuery: false,
			});

			let totalPage = Math.ceil(totalCount / limit);

			return {
				httpCode: SUCCESS_CODE,
				result: {
					status: true,
					message: "SUCCESS",
					data: {
						list: fetchList,
						totalRecords: totalCount,
						totalPages: totalPage,
						currentPage: parseInt(Page),
					},
				},
			};
		} else {
			return {
				httpCode: SUCCESS_CODE,
				result: {
					status: true,
					message: "SUCCESS",
					data: {list: fetchList},
				},
			};
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {
				status: false,
				message: error.message,
			},
		};
	}
};

exports.UserModifyController = async (payloadUser, payloadBody, payloadFile) => {
	try {
		let {OrgId, BranchId, UserId} = payloadUser;

		const {EditUserId, FirstName, LastName, UserEmail, UserNumber, Language, RoleId} = payloadBody;

		if (!FirstName || !LastName || !UserEmail || !RoleId) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		const target = await UserModel.findOne({
			where: {
				[Op.or]: [{Email: UserEmail || ""}, {Mobile: UserNumber || ""}],
				isDeleted: false,
			},
			include: [
				{
					model: OrgUsersModel,
				},
			],
		});

		if (!EditUserId) {
			let findBranchInUser = {};

			if (target?.UserId) {
				findBranchInUser = target?.orgusers?.find((item) => item.OrgId === OrgId && item.BranchId === BranchId);

				if (findBranchInUser?.OrgUserId && !findBranchInUser?.isDeleted) {
					return {
						httpCode: SUCCESS_CODE,
						result: {status: false, message: "DUPLICATE"},
					};
				} else if (findBranchInUser?.OrgUserId) {
					await OrgUsersModel.update(
						{isDeleted: false, RoleId: RoleId},
						{
							where: {
								OrgUserId: findBranchInUser?.OrgUserId,
							},
						}
					);

					return {
						httpCode: SUCCESS_CODE,
						result: {status: true, message: "USER_CREATED"},
					};
				} else {
					await OrgUsersModel.create({
						OrgId: OrgId,
						BranchId: BranchId,
						UserId: target?.UserId,
						RoleId: RoleId,
						DefaultOrg: false,
					});

					await UserBasedDefaultCategory(target?.UserId, OrgId, BranchId);

					return {
						httpCode: SUCCESS_CODE,
						result: {status: true, message: "USER_CREATED"},
					};
				}
			}

			const uuid = uuidv4();
			let imagePath = null;
			const password = await generatePassword(12);

			if (payloadFile) {
				imagePath = await FileUpload(payloadFile?.ImgPath, uuid, UserProfileImagePath);
			}

			const NewUser = await UserModel.create({
				FirstName: FirstName?.trim(),
				LastName: LastName?.trim(),
				UUID: uuid,
				ImgPath: imagePath || null,
				Email: UserEmail?.trim() || null,
				Mobile: UserNumber || null,
				Password: bcrypt?.hashSync(password?.trim(), 10),
				AvatarName: `${FirstName?.charAt(0).toUpperCase() || ""}${LastName?.charAt(0).toUpperCase() || ""}`,
				Language: Language || "EN",
			});

			await OrgUsersModel.create({
				OrgId: OrgId,
				BranchId: BranchId,
				UserId: NewUser?.UserId,
				RoleId: RoleId,
				DefaultOrg: true,
			});

			await UserBasedDefaultCategory(NewUser?.UserId, OrgId, BranchId);

			await registrationUser(FirstName, LastName, UserEmail, password);

			return {
				httpCode: SUCCESS_CODE,
				result: {status: true, message: "USER_CREATED"},
			};
		} else {
			if (target?.EditUserId && target?.EditUserId != EditUserId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: false,
						message: "DUPLICATE",
					},
				};
			} else {
				let imagePath = target?.ImgPath;

				if (payloadFile) {
					imagePath = await FileUpload(payloadFile?.ImgPath, target?.UUID, UserProfileImagePath, target?.ImgPath);
				}
				await UserModel.update(
					{
						FirstName: FirstName?.trim(),
						LastName: LastName?.trim(),
						AvatarName: `${FirstName?.charAt(0).toUpperCase() || ""}${LastName?.charAt(0).toUpperCase() || ""}`,
						Email: UserEmail?.trim(),
						Mobile: UserNumber || null,
						Language: Language || "EN",
						ImgPath: imagePath || null,
					},
					{
						where: {
							isDeleted: false,
							UserId: EditUserId,
						},
					}
				);

				await OrgUsersModel.update(
					{RoleId: RoleId},
					{
						where: {
							OrgId: OrgId,
							BranchId: BranchId,
							UserId: EditUserId,
						},
					}
				);

				return {
					httpCode: SUCCESS_CODE,
					result: {status: true, message: "SUCCESS"},
				};
			}
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {
				status: false,
				message: error.message,
			},
		};
	}
};

exports.UserRemoveController = async (payloadUser, payloadQuery) => {
	try {
		console.log(payloadUser, "payloadUser ");
		const {OrgId, BranchId, UserId, RoleId} = payloadUser;
		const {RemoveId} = payloadQuery;

		// if (RoleId === superAdminRoleId) {
		// 	await UserModel.update(
		// 		{
		// 			isDeleted: true,
		// 			isActive: false,
		// 		},
		// 		{
		// 			where: {
		// 				OrgId: OrgId,
		// 				BranchId: BranchId,
		// 				UserId: RemoveId,
		// 			},
		// 		}
		// 	);

		// 	await OrgUsersModel.update(
		// 		{
		// 			isDeleted: true,
		// 			isActive: false,
		// 		},
		// 		{
		// 			where: {
		// 				UserId: RemoveId,
		// 			},
		// 		}
		// 	);
		// } else {
		await OrgUsersModel.update(
			{
				isDeleted: true,
				isActive: false,
			},
			{
				where: {
					OrgId: OrgId,
					BranchId: BranchId,
					UserId: RemoveId,
				},
			}
		);
		// }
		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
			},
		};
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {
				status: false,
				message: error.message,
			},
		};
	}
};

exports.DefaultBrachController = async (payloadUser, payloadQuery) => {
	try {
		const {OrgId, UserId, RoleId} = payloadUser;
		const {BranchId} = payloadQuery;

		await defaultOrgSetAction(UserId, BranchId);
		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
			},
		};
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {
				status: false,
				message: error.message,
			},
		};
	}
};

exports.SettingGetController = async (payloadUser) => {
	try {
		const {UserId} = payloadUser;

		const data = await SettingModel.findOne({
			where: {
				UsedBy: UserId,
			},
			raw: true,
		});
		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "SUCCESS",
				data: data,
			},
		};
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {
				status: false,
				message: error.message,
			},
		};
	}
};

exports.SettingModifyController = async (payloadUser, payloadBody) => {
	try {
		let {UserId} = payloadUser;

		const {DefaultTimeFrame, DefaultDuration, DefaultDateFormat, DefaultCurrency, AmountHide, ThemeMode, ThemePrimary} = payloadBody;

		if (!UserId) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		const target = await SettingModel.findOne({
			where: {
				UsedBy: UserId,
			},
			raw: true,
		});

		if (!target?.SettingId) {
			await SettingModel.create({
				DefaultTimeFrame,
				DefaultDuration,
				DefaultDateFormat,
				DefaultCurrency,
				AmountHide: AmountHide ? 1 : 0,
				ThemeMode: ThemeMode || 'light',
				ThemePrimary: ThemePrimary || null,
				UsedBy: UserId,
			});

			return {
				httpCode: SUCCESS_CODE,
				result: {status: true, message: "SUCCESS"},
			};
		} else {
			await SettingModel.update(
				{
					DefaultTimeFrame,
					DefaultDuration,
					DefaultDateFormat,
					DefaultCurrency,
					AmountHide: AmountHide ? 1 : 0,
					ThemeMode: ThemeMode || target.ThemeMode || 'light',
					ThemePrimary: typeof ThemePrimary !== 'undefined' ? ThemePrimary : target.ThemePrimary,
				},
				{
					where: {
						UsedBy: UserId,
					},
				}
			);

			return {
				httpCode: SUCCESS_CODE,
				result: {status: true, message: "SUCCESS"},
			};
		}
	} catch (error) {
		console.log(`\x1b[91m ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {
				status: false,
				message: error.message,
			},
		};
	}
};

exports.UserProfileUpdateController = async (payloadUser, payloadBody, payloadFile) => {
	try {
		const {UserId} = payloadUser;
		const {FirstName, LastName, UserEmail, UserNumber, Language, RoleId} = payloadBody;

		// Validate required fields
		if (!FirstName || !LastName || !UserEmail) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "BAD_REQUEST_CODE"},
			};
		}

		// Find the current user
		const currentUser = await UserModel.findOne({
			where: {
				UserId: UserId,
				isDeleted: false,
			},
			raw: true,
		});

		if (!currentUser) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {status: false, message: "USER_NOT_FOUND"},
			};
		}

		// Check if email is being changed and if it's already taken by another user
		if (UserEmail !== currentUser.Email) {
			const emailExists = await UserModel.findOne({
				where: {
					Email: UserEmail,
					UserId: {[Op.ne]: UserId},
					isDeleted: false,
				},
				raw: true,
			});

			if (emailExists) {
				return {
					httpCode: BAD_REQUEST_CODE,
					result: {status: false, message: "EMAIL_ALREADY_EXISTS"},
				};
			}
		}

		// Check if mobile number is being changed and if it's already taken by another user
		if (UserNumber && UserNumber !== currentUser.Mobile) {
			const mobileExists = await UserModel.findOne({
				where: {
					Mobile: UserNumber,
					UserId: {[Op.ne]: UserId},
					isDeleted: false,
				},
				raw: true,
			});

			if (mobileExists) {
				return {
					httpCode: BAD_REQUEST_CODE,
					result: {status: false, message: "MOBILE_ALREADY_EXISTS"},
				};
			}
		}

		// Handle profile image upload
		let imagePath = currentUser.ImgPath;
		if (payloadFile && payloadFile.ImgPath) {
			const uuid = currentUser.UUID || uuidv4();
			imagePath = await FileUpload(payloadFile.ImgPath, uuid, UserProfileImagePath);
		}

		// Update user profile
		await UserModel.update(
			{
				FirstName: FirstName.trim(),
				LastName: LastName.trim(),
				Email: UserEmail.trim(),
				Mobile: UserNumber || null,
				Language: Language || 'EN',
				ImgPath: imagePath,
				UpdatedAt: new Date(),
			},
			{
				where: {
					UserId: UserId,
				},
			}
		);

		// Update role if provided and user has org access
		// if (RoleId) {
		// 	await OrgUsersModel.update(
		// 		{
		// 			RoleId: RoleId,
		// 			UpdatedAt: new Date(),
		// 		},
		// 		{
		// 			where: {
		// 				UserId: UserId,
		// 				isDeleted: false,
		// 			},
		// 		}
		// 	);
		// }

		return {
			httpCode: SUCCESS_CODE,
			result: {
				status: true,
				message: "PROFILE_UPDATED_SUCCESSFULLY",
			},
		};
	} catch (error) {
		console.log(`\x1b[91m UserProfileUpdateController Error: ${error} \x1b[91m`);
		return {
			httpCode: SERVER_ERROR_CODE,
			result: {
				status: false,
				message: error.message,
			},
		};
	}
};
