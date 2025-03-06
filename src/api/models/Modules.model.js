module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('modules', {
        ModulesId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        ModulesName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        Description: {
            type: DataTypes.STRING(1000),
            allowNull: false,
        },
        Router: {
            type: DataTypes.STRING,
        },
        ParentNoteId: {
            type: DataTypes.INTEGER,
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
        OrgId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        BranchId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        modelName: 'modules',
        initialAutoIncrement: 1,
    });

    return ModelTable;
};