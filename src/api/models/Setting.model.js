
module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('setting', {
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
        },
        DefaultDuration: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "Last_Thirty_Days",
        },
        DefaultFormat: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "Monthly",
        },
        DefaultCurrency: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "Rs",
        },
        AmountHide:{
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
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