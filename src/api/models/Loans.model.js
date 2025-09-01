module.exports = (sequelize, DataTypes) => {
	const ModelTable = sequelize.define(
		"fn_loans",
		{
			LoanId: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
				unique: true,
			},
			UUID: {
				type: DataTypes.STRING(500),
				allowNull: false,
				unique: true,
			},
			LoanName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			LoanType: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			LenderName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			LoanAmount: {
				type: DataTypes.DECIMAL(10, 2),
				defaultValue: 0,
			},
			PreAmount: {
				type: DataTypes.DECIMAL(10, 2),
				defaultValue: 0,
			},
			InterestRate: {
				type: DataTypes.DECIMAL(10, 2),
				defaultValue: 0,
			},
			EmiAmount: {
				type: DataTypes.DECIMAL(10, 2),
				defaultValue: 0,
			},
			StartDate: {
				type: DataTypes.DATEONLY,
				defaultValue: 0,
			},
			EndDate: {
				type: DataTypes.DATEONLY,
				defaultValue: 0,
			},
			AccountId: {
				type: DataTypes.INTEGER,
			},
			Status: {
				type: DataTypes.ENUM("Pending", "Ongoing", "Completed", "Overdue"),
			},
			RepaymentFrequency: {
				type: DataTypes.ENUM("Monthly", "Weekly", "Yearly"),
			},
			Description: {
				type: DataTypes.STRING(1000),
			},
			isUsing: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
				defaultValue: true,
			},
			isActive: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
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
			modelName: "fn_loans",
			initialAutoIncrement: 1,
		}
	);

	return ModelTable;
};
