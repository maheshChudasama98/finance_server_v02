module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('kn_Topic', {
        TopicId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        TopicTitle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        TopicDesc: {
            type: DataTypes.STRING(1000)
        },
        ColorCode: {
            type: DataTypes.STRING(50)
        },
        Position: {
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
        modelName: 'kn_Topic',
        initialAutoIncrement: 1,
    });

    return ModelTable;
};