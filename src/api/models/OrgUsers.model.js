module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('orgusers', {
        OrgUserId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        OrgId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        BranchId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        RoleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        DefaultOrg: {
            type: DataTypes.BOOLEAN,
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

    }, {
        modelName: 'orgusers',
        initialAutoIncrement: 1,
        // timestamps: false,
    });

    return ModelTable;
};