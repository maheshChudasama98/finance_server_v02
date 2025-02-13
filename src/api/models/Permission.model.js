module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('permission', {
        PermissionId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        ModuleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        RoleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        CanRead: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        CanWrite: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true,
            
        },
    }, {
        modelName: 'permission',
        initialAutoIncrement: 1,
        timestamps: false,
    });

    return ModelTable;
};