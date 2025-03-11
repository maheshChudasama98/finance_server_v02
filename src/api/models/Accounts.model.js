module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('fn_accounts', {
        AccountId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        UUID: {
            type: DataTypes.STRING(500),
            allowNull: false,
            unique: true
        },
        AccountName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        StartAmount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        CurrentAmount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        MinAmount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        MaxAmount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        TypeId: {
            type: DataTypes.INTEGER,
        },
        ImgPath: {
            type: DataTypes.STRING,
        },
        Icon: {
            type: DataTypes.STRING,
        },
        Color: {
            type: DataTypes.STRING(20),
        },
        Description: {
            type: DataTypes.STRING(1000)
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
    }, {
        modelName: 'fn_accounts',
        initialAutoIncrement: 1,
        indexes: [
            {
                unique: false,
                fields: ['AccountName', 'TypeId'],
            },
        ]
        // timestamps: false,
    });

    return ModelTable;
};