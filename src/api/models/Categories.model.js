module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('fn_categories', {
        CategoryId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        CategoryName: {
            type: DataTypes.STRING,
            allowNull: false,
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
    }, {
        modelName: 'fn_categories',
        initialAutoIncrement: 1,
        // timestamps: false,
    });

    return ModelTable;
};