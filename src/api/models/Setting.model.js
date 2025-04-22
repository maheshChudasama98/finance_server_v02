
module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('settings', {
        SettingId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        UsedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        DefaultTimeFrame: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "MONTH",
        },
        DefaultDuration: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Last_Thirty_Days",
        },
        DefaultDateFormat: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "DD/MM/YYYY",
        },
        DefaultCurrency: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "INR",
        },
        AmountHide:{
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true,
        }
    }, {
        modelName: 'setting',
        initialAutoIncrement: 1,
        indexes: [
            {
                unique: false,
                fields: ['SettingId', 'UsedBy'],
            },
        ],
        timestamps: false,
    });

    return ModelTable;
};