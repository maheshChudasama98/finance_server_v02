const {SUCCESS_CODE, BAD_REQUEST_CODE, SERVER_ERROR_CODE} = require("../constants/statusCode");
const {getPagination} = require("../../helpers/Actions.helper");
const {v4: uuidv4} = require("uuid");

const db = require("../models/index");
const {Op, Sequelize} = require("sequelize");
const { FileUpload } = require("../../helpers/FileUpload.helper");
const { OrgImagePath, BranchImagePath } = require("../constants/constants");
const { modulesList, roleList } = require("../constants/defaultData");
const OrgModel = db.OrgModel;
const ModulesModel = db.ModulesModel;
const BranchesModel = db.BranchesModel;
const RolesModel = db.RolesModel;
const PermissionModel = db.PermissionModel;
const OrgUsersModel = db.OrgUsersModel;

// ------------------------ || Org Controllers || ------------------------ //

exports.OrgModifyController = async (payloadUser, payloadBody, payloadFile) => {
    try {
        const { OrgId, OrgName, Description } = payloadBody;

		const orgTarget = await OrgModel.findOne({
			where: {OrgName: OrgName},
			raw: true,
		});

		if (!OrgId) {
			if (orgTarget?.OrgId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {status: false, message: "DUPLICATE"},
				};
			} else {
				const uuid = uuidv4();
				let imagePath = null;

				if (payloadFile) {
					imagePath = await FileUpload(payloadFile?.ImgPath, uuid, OrgImagePath);
				}


                const NewOrg = await OrgModel.create({
                    OrgName: OrgName?.trim() || null,
                    Description: Description,
                    ImgPath: imagePath,
                    UUID: uuid,
                    isDeleted: false,
                    isActive: true
                });

                const NewBranch = await BranchesModel.create({
                    BranchName: "Main Branch" || null,
                    Description: "This is main branch",
                    OrgId: NewOrg.OrgId,
                    UUID: uuidv4(),
                    isDeleted: false,
                    isActive: true
                });

                for (let index = 0; index < modulesList.length; index++) {

                    const element = modulesList[index];

                    const findModules = await ModulesModel.findOne({
                        where: {
                            ModulesName: element?.ModulesName,
                            OrgId: NewOrg?.OrgId,
                            BranchId: NewBranch?.BranchId,
                        },
                        raw: true
                    });

                    if (!findModules?.ModulesId) {
                        await ModulesModel.create({
                            ModulesName: element?.ModulesName,
                            Description: element?.Description,
                            OrgId: NewOrg?.OrgId,
                            BranchId: NewBranch?.BranchId,
                            Icon: element?.Icon,
                            Router: element?.Router,
                            isDeleted: false,
                            isActive: true
                        });
                    };					
                };

                const filter = roleList?.filter(item => item?.RoleName !== "Super Admin");
								
                for (let index = 0; index < filter.length; index++) {

                    const element = filter[index];

                    const findRole = await RolesModel.findOne({
                        where: {
                            RoleName: element?.RoleName,
                            OrgId: NewOrg?.OrgId,
                            BranchId: NewBranch?.BranchId,
                        },
                        raw: true
                    });

                    if (!findRole?.RoleId) {

                        const roleCreated = await RolesModel.create({
                            RoleName: element?.RoleName,
                            Description: element?.Description,
                            OrgId: NewOrg?.OrgId,
                            BranchId: NewBranch?.BranchId,
                            isDeleted: false,
                            isActive: true
                        });

                        const listModules = await ModulesModel.findAll({
                            where: {
                                OrgId: NewOrg?.OrgId,
                            }, raw: true
                        });

                        for (let index = 0; index < listModules.length; index++) {

                            const element = listModules[index];

                            await PermissionModel.create({
                                RoleId: roleCreated?.RoleId,
                                ModuleId: element?.ModulesId,
                                CanRead: true,
                                CanWrite: true
                            });
                        };

                    };
                };

                await OrgUsersModel.create({
                    OrgId: NewOrg?.OrgId,
                    BranchId: NewBranch?.BranchId,
                    UserId: 1,
                    RoleId: 1,
                    isDeleted: false,
                    isActive: true,
                })

                return ({
                    httpCode: SUCCESS_CODE,
                    result: { status: true, message: "SUCCESS" }
                });
            };

        } else {

            if (orgTarget?.OrgId && orgTarget?.OrgId != OrgId) {

                return ({
                    httpCode: SUCCESS_CODE,
                    result: { status: false, message: "DUPLICATE" }
                });

            } else {

                let imagePath = orgTarget?.ImgPath;

                if (payloadFile) {
                    imagePath = await FileUpload(payloadFile?.ImgPath, orgTarget?.UUID, OrgImagePath, orgTarget?.ImgPath);
                };

                await OrgModel.update({
                    OrgName: OrgName?.trim() || null,
                    Description: Description,
                    ImgPath: imagePath,
                }, { where: { OrgId: OrgId } });

                return ({
                    httpCode: SUCCESS_CODE,
                    result: { status: true, message: "SUCCESS" }
                });

            };
        };

    } catch (error) {
        console.log(`\x1b[91m ${error} \x1b[91m`);
        return ({
            httpCode: SERVER_ERROR_CODE,
            result: { status: false, message: error.message }
        });
    };

};

exports.OrgListController = async (payloadUser, payloadBody) => {
	try {
		const {Action, Page, PageSize, FilterBy} = payloadBody;

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

		const whereCondition = {isDeleted: false};

		if (FilterBy?.OrgName) {
			whereCondition.OrgName = {[Op.like]: "%" + FilterBy?.OrgName + "%"};
		}

		if (FilterBy?.IsActive == true || FilterBy?.IsActive == false) {
			whereCondition.isActive = {[Op.eq]: FilterBy?.IsActive};
		}

		const OrgList = await OrgModel.findAll({
			attributes: [
				"OrgId",
				"OrgName",
				"Description",
				"isActive",
				"createdAt",
				[Sequelize.literal(`CASE  WHEN ImgPath IS NOT NULL THEN CONCAT('${OrgImagePath}','/', UUID, '/', ImgPath)  ELSE NULL  END`), "ImgPath"],
				[Sequelize.literal(`( SELECT COUNT(*) FROM branches WHERE branches.OrgId = orgs.OrgId  AND branches.isDeleted = false)`), "TotalBranches"],
				[Sequelize.literal(`( SELECT COUNT(*) FROM orgusers WHERE orgusers.OrgId = orgs.OrgId  AND orgusers.isDeleted = false)`), "TotalUser"],
				[
					Sequelize.literal(`(
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'OrgId', branches.OrgId,
                                'BranchId', branches.BranchId,
                                'BranchName', branches.BranchName,
                                'Description', branches.Description,
                                'Address', branches.Address,
                                'City', branches.City,
                                'GstNumber', branches.GstNumber,
                                'Phone', branches.Phone,
                                'Email', branches.Email,
                                'ImgPath', branches.ImgPath,
                                'createdAt', branches.createdAt,
                                'ImgPath', CONCAT('${BranchImagePath}','/', branches.UUID, '/', branches.ImgPath),
                                'BranchUser', (SELECT COUNT(orgusers.BranchId)  FROM orgusers  WHERE orgusers.BranchId = branches.BranchId  AND orgusers.isDeleted = false)
                            )
                        )
                        FROM branches  
                        WHERE branches.OrgId = orgs.OrgId 
                        AND branches.isDeleted = false
                    )`),
					"BranchesList",
				],
			],

			where: whereCondition,
			limit: limit,
			offset: offset,
			order: [["createdAt", "DESC"]],
			raw: true,
		});

		if (Action) {
			const totalCount = await OrgModel.count({
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
						list: OrgList,
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
					data: {list: OrgList},
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

exports.OrgRemoveController = async (payloadUser, payloadQuery) => {
	try {
		const {OrgId} = payloadQuery;

		await OrgModel.update(
			{
				isDeleted: true,
			},
			{
				where: {OrgId: OrgId},
			}
		);

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

exports.OrgActiveController = async (payloadUser, payloadQuery) => {
	try {
		const {OrgId} = payloadQuery;

		const orgFind = await OrgModel.findOne({
			attributes: ["isActive"],
			where: {OrgId: OrgId},
			raw: true,
		});

		await OrgModel.update({isActive: !orgFind?.isActive}, {where: {OrgId: OrgId}});

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

// ------------------------ || Branches Controllers || ------------------------ //

exports.BranchModifyController = async (payloadUser, payloadBody, payloadFile) => {
	try {
		const {BranchId, BranchName, Description, Address, City, State, GstNumber, Phone, Email} = payloadBody;

		const target = await BranchesModel.findOne({
			where: {
				BranchName: BranchName,
				OrgId: payloadUser?.OrgId,
				isDeleted: false,
			},
			raw: true,
		});

		if (!BranchId) {
			if (target?.BranchId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: false,
						message: "DUPLICATE",
					},
				};
			} else {
				const uuid = uuidv4();

				let imagePath = null;

				if (payloadFile) {
					imagePath = await FileUpload(payloadFile?.ImgPath, uuid, BranchImagePath);
				}

				await BranchesModel.create({
					BranchName: BranchName?.trim() || null,
					Description: Description,
					OrgId: payloadUser?.OrgId,
					ImgPath: imagePath,
					Address,
					City,
					State,
					GstNumber,
					Phone,
					Email,
					UUID: uuid,
					isDeleted: false,
					isActive: true,
				});

				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: true,
						message: "SUCCESS",
					},
				};
			}
		} else {
			if (target?.BranchId && target?.BranchId != BranchId) {
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
					imagePath = await FileUpload(payloadFile?.ImgPath, target?.UUID, BranchImagePath, target?.ImgPath);
				}

				await BranchesModel.update(
					{
						BranchName: BranchName?.trim() || null,
						Description: Description,
						ImgPath: imagePath,
						Address,
						City,
						State,
						GstNumber,
						Phone,
						Email,
					},
					{where: {BranchId: BranchId}}
				);

				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: true,
						message: "SUCCESS",
					},
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

exports.BranchListController = async (payloadUser, payloadBody) => {
	try {
		const {Action, Page, PageSize, FilterBy} = payloadBody;

		

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

		const whereCondition = {isDeleted: false};

		if (FilterBy?.BranchName) {
			whereCondition.BranchName = {[Op.like]: "%" + FilterBy?.BranchName + "%"};
		}

		if (FilterBy?.IsActive == true || FilterBy?.IsActive == false) {
			whereCondition.isActive = {[Op.eq]: FilterBy?.IsActive};
		}

		if (FilterBy?.Orgs && FilterBy?.Orgs?.length > 0) {
			whereCondition.OrgId = {[Op.in]: FilterBy?.Orgs};
		}
		if (payloadUser?.RoleId !== 1) {
			whereCondition.OrgId = payloadUser?.OrgId;
		}

		const branchesList = await BranchesModel.findAll({
			attributes: [
				"BranchId",
				"BranchName",
				"Description",
				"Address",
				"City",
				"State",
				"GstNumber",
				"Phone",
				"Email",
				"isActive",
				"createdAt",
				"updatedAt",
				[Sequelize.literal(`CONCAT('${BranchImagePath}','/', branches.UUID, '/', branches.ImgPath)`), "ImgPath"],
				[Sequelize.col("org.OrgName"), "OrgName"],
				[Sequelize.literal(`(SELECT COUNT(orgusers.BranchId)  FROM orgusers  WHERE orgusers.BranchId = branches.BranchId  AND orgusers.isDeleted = false)`), "TotalUser"],
				[
					Sequelize.literal(`(
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'UserId', users.UserId,
                            'FullName', CONCAT(users.FirstName, ' ', users.LastName),
                            'FirstName', users.FirstName,
                            'LastName', users.LastName,
                            'AvatarName', users.AvatarName,
                            'ImgPath', users.ImgPath,
                            'Email', users.Email,
                            'createdAt', users.createdAt
                        )
                    )
                    FROM orgusers JOIN users ON users.UserId = orgusers.UserId WHERE orgusers.BranchId = branches.BranchId  AND orgusers.isDeleted = false
                )`),
					"UserList",
				],
			],
			include: [
				{
					model: OrgModel,
					attributes: [],
				},
			],
			where: whereCondition,
			limit: limit,
			offset: offset,
			order: [["createdAt", "DESC"]],
			raw: true,
		});

		if (Action) {
			const totalCount = await BranchesModel.count({
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
						list: branchesList,
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
					data: {list: branchesList},
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

exports.BranchRemoveController = async (payloadUser, payloadQuery) => {
	try {
		const {BranchId} = payloadQuery;

		await BranchesModel.update(
			{
				isDeleted: true,
			},
			{
				where: {BranchId: BranchId},
			}
		);

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

exports.BranchActiveController = async (payloadUser, payloadQuery) => {
	try {
		const {BranchId} = payloadQuery;

		const target = await BranchesModel.findOne({
			attributes: ["isActive"],
			where: {BranchId: BranchId},
			raw: true,
		});

		await BranchesModel.update({isActive: !target?.isActive}, {where: {BranchId: BranchId}});

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

// ------------------------ || Modules Controllers || ------------------------ //

exports.ModuleModifyController = async (payloadUser, payloadBody) => {
	try {
		const {ModulesId, ModulesName, Description, ParentNoteId, Router, Icon} = payloadBody;

		const target = await ModulesModel.findOne({
			where: {
				ModulesName: ModulesName,
				// OrgId: payloadUser?.OrgId,
				// isDeleted: false
			},
			raw: true,
		});

		if (!ModulesId) {
			if (target?.ModulesId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: false,
						message: "DUPLICATE",
					},
				};
			} else {
				const created = await ModulesModel.create({
					ModulesName: ModulesName?.trim() || null,
					Router: Router?.trim() || null,
					Description: Description,
					ParentNoteId: ParentNoteId || null,
					Icon: Icon || null,
					OrgId: payloadUser?.OrgId,
					BranchId: payloadUser?.BranchId,
					isDeleted: false,
					isActive: true,
				});

				const roleList = await RolesModel.findAll({
					where: {
						isDeleted: false,
						OrgId: payloadUser?.OrgId,
					},
					raw: true,
				});

				const bulkData = await roleList.map((item) => ({
					ModuleId: created?.ModulesId,
					RoleId: item?.RoleId,
					CanRead: true,
					CanWrite: true,
				}));

				await PermissionModel.bulkCreate(bulkData);

				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: true,
						message: "SUCCESS",
					},
				};
			}
		} else {
			if (target?.ModulesId && target?.ModulesId != ModulesId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: false,
						message: "DUPLICATE",
					},
				};
			} else {
				await ModulesModel.update(
					{
						ModulesName: ModulesName?.trim() || null,
						Router: Router?.trim() || null,
						Description: Description,
						Icon: Icon || null,
						ParentNoteId: ParentNoteId || null,
					},
					{where: {ModulesId: ModulesId}}
				);

				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: true,
						message: "SUCCESS",
					},
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

exports.ModuleListController = async (payloadUser, payloadBody) => {
	try {
		const {Action, Page, PageSize, FilterBy} = payloadBody;

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
			OrgId: payloadUser?.OrgId,
		};

		if (FilterBy?.ModulesName) {
			whereCondition.ModulesName = {[Op.like]: "%" + FilterBy?.ModulesName + "%"};
		}

		if (FilterBy?.IsActive == true || FilterBy?.IsActive == false) {
			whereCondition.isActive = {[Op.eq]: FilterBy?.IsActive};
		}

		const list = await ModulesModel.findAll({
			attributes: ["ModulesId", "ModulesName", "Description", "ParentNoteId", "Icon", "Router", "isDeleted", "isActive", "createdAt", "updatedAt"],
			where: whereCondition,
			limit: limit,
			offset: offset,
			order: [["ModulesName", "ASC"]],
			raw: true,
		});

		if (Action) {
			const totalCount = await ModulesModel.count({
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
						list: list,
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
					data: {list: list},
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

exports.ModuleRemoveController = async (payloadUser, payloadQuery) => {
	try {
		const {ModulesId} = payloadQuery;

		await ModulesModel.update(
			{
				isDeleted: true,
			},
			{
				where: {ModulesId: ModulesId},
			}
		);

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

exports.ModuleActiveController = async (payloadUser, payloadQuery) => {
	try {
		const {ModulesId} = payloadQuery;

		const target = await ModulesModel.findOne({
			attributes: ["isActive"],
			where: {ModulesId: ModulesId},
			raw: true,
		});

		await ModulesModel.update({isActive: !target?.isActive}, {where: {ModulesId: ModulesId}});

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

// ------------------------ || Roles Controllers || ------------------------ //

exports.RoleModifyController = async (payloadUser, payloadBody) => {
	try {
		const {RoleId, RoleName, Description} = payloadBody;

		const target = await RolesModel.findOne({
			where: {
				RoleName: RoleName,
				OrgId: payloadUser?.OrgId,
				isDeleted: false,
			},
			raw: true,
		});

		if (!RoleId) {
			if (target?.RoleId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: false,
						message: "DUPLICATE",
					},
				};
			} else {
				const roleCreated = await RolesModel.create({
					RoleName: RoleName?.trim() || null,
					Description: Description,
					OrgId: payloadUser?.OrgId,
					BranchId: payloadUser?.BranchId,
					isDeleted: false,
					isActive: true,
				});

				const moduleList = await ModulesModel.findAll({
					where: {
						isDeleted: false,
						OrgId: payloadUser?.OrgId,
					},
					raw: true,
				});

				const bulkData = await moduleList.map((item) => ({
					ModuleId: item?.ModulesId,
					RoleId: roleCreated?.RoleId,
					CanRead: true,
					CanWrite: true,
				}));

				await PermissionModel.bulkCreate(bulkData);

				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: true,
						message: "SUCCESS",
					},
				};
			}
		} else {
			if (target?.RoleId && target?.RoleId != RoleId) {
				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: false,
						message: "DUPLICATE",
					},
				};
			} else {
				await RolesModel.update(
					{
						RoleName: RoleName?.trim() || null,
						Description: Description,
					},
					{where: {RoleId: RoleId}}
				);

				return {
					httpCode: SUCCESS_CODE,
					result: {
						status: true,
						message: "SUCCESS",
					},
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

exports.RoleListController = async (payloadUser, payloadBody) => {
	try {
		const {Action, Page, PageSize, FilterBy} = payloadBody;

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

		const whereCondition = {isDeleted: false, OrgId: payloadUser?.OrgId};

		if (FilterBy?.RoleName) {
			whereCondition.RoleName = {[Op.like]: "%" + FilterBy?.RoleName + "%"};
		}

		if (FilterBy?.IsActive == true || FilterBy?.IsActive == false) {
			whereCondition.isActive = {[Op.eq]: FilterBy?.IsActive};
		}

		if (FilterBy?.Orgs && FilterBy?.Orgs?.length > 0) {
			whereCondition.OrgId = {[Op.in]: FilterBy?.Orgs};
		}

		if (payloadUser?.RoleId !== 1) {
			whereCondition.RoleId = {[Op.not]: 1};
		} 

		const list = await RolesModel.findAll({
			attributes: ["RoleId", "RoleName", "Description", "isActive", "createdAt", "updatedAt"],
			where: whereCondition,
			limit: limit,
			offset: offset,
			order: [["createdAt", "DESC"]],
			raw: true,
		});

		if (Action) {
			const totalCount = await BranchesModel.count({
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
						list: list,
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
					data: {list: list},
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

exports.RoleRemoveController = async (payloadUser, payloadQuery) => {
	try {
		const {RoleId} = payloadQuery;

		await RolesModel.update(
			{
				isDeleted: true,
			},
			{
				where: {RoleId: RoleId},
			}
		);

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

exports.RoleActiveController = async (payloadUser, payloadQuery) => {
	try {
		const {RoleId} = payloadQuery;

		const target = await RolesModel.findOne({
			attributes: ["isActive"],
			where: {RoleId: RoleId},
			raw: true,
		});

		await RolesModel.update({isActive: !target?.isActive}, {where: {RoleId: RoleId}});

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

exports.PermissionController = async (payloadUser, payloadQuery) => {
	try {
		const {RoleId} = payloadQuery;

		if (!RoleId) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {
					status: false,
					message: "BAD_REQUEST_CODE",
				},
			};
		}

		async function fetchModulesWithChildren(parentId = null) {
			try {
				const modules = await ModulesModel.findAll({
					attributes: [
						"ModulesId",
						"ModulesName",
						"Description",
						[Sequelize.col("permissions.PermissionId"), "PermissionId"],
						[Sequelize.col("permissions.CanRead"), "CanRead"],
						[Sequelize.col("permissions.CanWrite"), "CanWrite"],
					],
					where: parentId ? {ParentNoteId: parentId, isDeleted: false} : {ParentNoteId: null, isDeleted: false},
					include: [
						{
							attributes: [],
							model: PermissionModel,
							where: {RoleId: RoleId},
						},
					],
					raw: true,
				});

				if (!modules.length) return [];

				for (let module of modules) {
					const children = await fetchModulesWithChildren(module.ModulesId);
					module.children = children;
				}
				return modules;
			} catch (error) {
				throw new Error(error.message);
			}
		}

		const getRoleAccessNested = await fetchModulesWithChildren();

		const moduleList = await PermissionModel.findAll({
			attributes: [
				"PermissionId",
				"ModuleId",
				"RoleId",
				"CanRead",
				"CanWrite",
				[Sequelize.col("module.ModulesName"), "ModulesName"],
				[Sequelize.col("module.Description"), "Description"],
				[Sequelize.col("module.Router"), "Router"],
				[Sequelize.col("module.isActive"), "isActive"],
				[Sequelize.col("module.createdAt"), "moduleCreatedAt"],

				[Sequelize.col("role.RoleName"), "RoleName"],
				[Sequelize.col("role.Description"), "roleDescription"],
				[Sequelize.col("role.createdAt"), "roleCreatedAt"],
			],
			where: {
				RoleId: RoleId,
			},
			include: [
				{
					model: ModulesModel,
					attributes: [],
				},
				{
					model: RolesModel,
					where: {
						OrgId: payloadUser?.OrgId,
					},
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
					nested: getRoleAccessNested,
					moduleList: moduleList,
				},
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

exports.PermissionModifyController = async (payloadUser, payloadBody) => {
	try {
		const {ModifyArray} = payloadBody;

		if (ModifyArray?.length <= 0) {
			return {
				httpCode: BAD_REQUEST_CODE,
				result: {
					status: false,
					message: "BAD_REQUEST_CODE",
				},
			};
		}

		for (let index = 0; index < ModifyArray?.length; index++) {
			const element = ModifyArray[index];

			const roleCheck = await PermissionModel.findOne({
				where: {
					PermissionId: element?.PermissionId,
				},
				raw: true,
			});

			if (roleCheck?.CanRead !== element?.CanRead || roleCheck?.CanWrite !== element?.CanWrite) {
				await PermissionModel.update(
					{
						CanRead: element?.CanRead,
						CanWrite: element?.CanWrite,
					},
					{
						where: {PermissionId: element?.PermissionId},
					}
				);
			}
		}

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
