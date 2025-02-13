module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('fn_sub_categories', {
        SubCategoryId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        SubCategoriesName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Icon: {
            type: DataTypes.STRING,
        },
        Description: {
            type: DataTypes.STRING(1000)
        },
        CategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        modelName: 'fn_sub_categories',
        initialAutoIncrement: 1,
        // timestamps: false,
    });

    return ModelTable;
};