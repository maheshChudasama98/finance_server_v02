module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('kn_Tasks', {
        TaskId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        TaskTitle: {
            type: DataTypes.STRING,
            allowNull: false
        },
        TaskDesc: {
            type: DataTypes.STRING(1000)
        },
        ImagePart: {
            type: DataTypes.STRING(1000)
        },
        TopicId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Position: {
            type: DataTypes.INTEGER,
            allowNull: false
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
        modelName: 'kn_Tasks',
        initialAutoIncrement: 1,
    });

    return ModelTable;
};