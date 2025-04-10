module.exports = (sequelize, DataTypes) => {
	const ModelTable = sequelize.define(
		"email_sms_content",
		{
			ContentId: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
				unique: true,
			},
			Type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			Title: {
				type: DataTypes.STRING,
			},
			Subject: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			Content: {
				type: DataTypes.TEXT("long"),
				allowNull: false,
			},
			Slug: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			isDeleted: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			CreateBy: {
				type: DataTypes.INTEGER,
			},
			OrgId: {
				type: DataTypes.INTEGER,
			},
			BranchId: {
				type: DataTypes.INTEGER,
			},
		},
		{
			modelName: "email_sms_content",
			initialAutoIncrement: 1,
			indexes: [
				{
					unique: false,
					fields: ["ContentId", "OrgId", "BranchId"],
				},
			],
			// timestamps: false,
		}
	);

	return ModelTable;
};
