module.exports = (sequelize, DataTypes) => {

    const ModelTable = sequelize.define('files', {
        Files: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        Module: {
            type: DataTypes.STRING(2000),
        },
        ModuleId: {
            type: DataTypes.INTEGER,
        },
        FileName: {
            type: DataTypes.STRING(500)
        },
        FilePath: {
            type: DataTypes.STRING(1000)
        },
    }, {
        modelName: 'files',
        initialAutoIncrement: 1,
        // timestamps: false,
    });

    return ModelTable;
};