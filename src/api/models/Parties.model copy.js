module.exports = (sequelize, DataTypes) => {
	const ModelTable = sequelize.define(
		"pr_projects",
		{
			ProjectId: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
				unique: true,
			},
			ProjectName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			UUID: {
				type: DataTypes.STRING(500),
				allowNull: false,
				unique: true,
			},
			StartAmount: {
				type: DataTypes.DECIMAL(10, 2),
				defaultValue: 0,
			},
			CurrentAmount: {
				type: DataTypes.DECIMAL(10, 2),
				defaultValue: 0,
			},
			MinAmount: {
				type: DataTypes.DECIMAL(10, 2),
				defaultValue: 0,
			},
			MaxAmount: {
				type: DataTypes.DECIMAL(10, 2),
				defaultValue: 0,
			},
			Phone: {
				type: DataTypes.STRING(40),
			},
			Email: {
				type: DataTypes.STRING,
			},
			City: {
				type: DataTypes.STRING,
			},
			State: {
				type: DataTypes.STRING,
			},
			Address: {
				type: DataTypes.STRING(1000),
			},
			Description: {
				type: DataTypes.STRING(1000),
			},
			ImgPath: {
				type: DataTypes.STRING(2000),
			},
			isUsing: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
				defaultValue: true,
			},
			isActive: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
				defaultValue: true,
			},
			isDeleted: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			UsedBy: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			OrgId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			BranchId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			modelName: "pr_projects",
			initialAutoIncrement: 1,
			// timestamps: false,
		}
	);

	return ModelTable;
};
