module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('roles', {
        RoleId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        RoleName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Icon: {
            type: DataTypes.STRING,
        },
        Description: {
            type: DataTypes.STRING(1000),
            allowNull: false,
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
        OrgId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        BranchId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        modelName: 'roles',
        initialAutoIncrement: 1,
        // timestamps: false,
    });

    return ModelTable;
};