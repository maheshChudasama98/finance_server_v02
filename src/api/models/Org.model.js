module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('orgs', {
        OrgId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        OrgName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        Description: {
            type: DataTypes.STRING(1000)
        },
        UUID: {
            type: DataTypes.STRING(500),
            allowNull: false,
            unique: true
        },
        ImgPath: {
            type: DataTypes.STRING(2000),
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
    }, {
        modelName: 'orgs',
        initialAutoIncrement: 1,
        // timestamps: false,
    });

    return ModelTable;
};