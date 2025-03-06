module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('branches', {
        BranchId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        BranchName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        UUID: {
            type: DataTypes.STRING(500),
            allowNull: false,
            unique: true
        },
        Description: {
            type: DataTypes.STRING(1000)
        },
        OrgId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Address: {
            type: DataTypes.STRING(1000)
        },
        City: {
            type: DataTypes.STRING,
        },
        State: {
            type: DataTypes.STRING,
        },
        GstNumber: {
            type: DataTypes.STRING(1000),
        },
        Phone: {
            type: DataTypes.STRING(40),
        },
        Email: {
            type: DataTypes.STRING,
        },
        ImgPath: {
            type: DataTypes.STRING(2000),
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,

        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true,
        },
    }, {
        modelName: 'branches',
        initialAutoIncrement: 1,
        // timestamps: false,
    });

    return ModelTable;
};