module.exports = (sequelize, DataTypes) => {
	const ModelTable = sequelize.define(
		"fn_loans_payments",
		{
			PaymentId: {
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
			LoanId: {
				type: DataTypes.INTEGER,
			},
			TransactionId: {
				type: DataTypes.INTEGER,
			},
			DueDate: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			AmountDue: {
				type: DataTypes.DECIMAL(10, 2),
				defaultValue: 0,
			},
			PrincipalPart: {
				type: DataTypes.DECIMAL(10, 2),
				defaultValue: 0,
			},
			InterestPart: {
				type: DataTypes.DECIMAL(10, 2),
				defaultValue: 0,
			},
			Status: {
				type: DataTypes.ENUM("Pending", "Paid", "Overdue"),
			},
			PaidDate: {
				type: DataTypes.DATEONLY,
				defaultValue: 0,
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
			modelName: "fn_loans_repayments",
			initialAutoIncrement: 1,
		}
	);

	return ModelTable;
};
