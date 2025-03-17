require('dotenv').config();

module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('users', {
        UserId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        UUID: {
            type: DataTypes.STRING(500),
        },
        FirstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        LastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        AvatarName: {
            type: DataTypes.STRING(2),
        },
        Email: {
            type: DataTypes.STRING(500),
            // unique: true
        },
        Mobile: {
            type: DataTypes.FLOAT,
            // unique: true
        },
        Password: {
            type: DataTypes.STRING(2000),
            allowNull: false,
        },
        ImgPath: {
            type: DataTypes.STRING(2000),
        },
        Language: {
            type: DataTypes.STRING(2),
            allowNull: false,
            defaultValue: "EN",
        },
        AuthOpt: {
            type: DataTypes.INTEGER,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.NOW,
        },
    }, {
        modelName: 'users',
        initialAutoIncrement: 1,
        timestamps: false,
    });

    return ModelTable;
};