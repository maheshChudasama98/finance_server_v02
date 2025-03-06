module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('daily_logs', {
        LogId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        DailyLog: {
            type: DataTypes.TEXT('long'),
        },
        Description: {
            type: DataTypes.STRING(2000)
        },
        Icons: {
            type: DataTypes.STRING,
        },
        Color: {
            type: DataTypes.STRING(50),
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Position: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        modelName: 'daily_logs',
        initialAutoIncrement: 1,
        // timestamps: false,
    });

    return ModelTable;
};