module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('fn_transactions', {
        TransactionId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        Action: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        Amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        CategoryId: {
            type: DataTypes.INTEGER,
        },
        SubCategoryId: {
            type: DataTypes.INTEGER,
        },
        AccountId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        TransferToAccountId: {
            type: DataTypes.INTEGER,
        },
        ParentTransactionId: {
            type: DataTypes.INTEGER,
        },
        PartyId: {
            type: DataTypes.INTEGER,
        },
        AccountAmount: {
            type: DataTypes.DECIMAL(10, 2),
        },
        PartyAmount: {
            type: DataTypes.DECIMAL(10, 2),
        },
        AccountBalance: {
            type: DataTypes.DECIMAL(10, 2),
        },
        PartyBalance: {
            type: DataTypes.DECIMAL(10, 2),
        },
        Description: {
            type: DataTypes.STRING(1000)
        },
        Tags: {
            type: DataTypes.STRING,
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
    }, {
        modelName: 'fn_transactions',
        initialAutoIncrement: 1,
        // timestamps: false,

        indexes: [
            {
                unique: false,
                fields: ['Action', 'Date'],
            },
            {
                unique: false,
                fields: ['AccountId'],
            },
        ]
    });

    return ModelTable;
};