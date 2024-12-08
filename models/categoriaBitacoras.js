'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class categoria_bitacoras extends Model {
        static associate(models) {
            categoria_bitacoras.hasMany(models.bitacoras, {
                foreignKey: 'idCategoriaBitacora'
            });
        }
    }

    categoria_bitacoras.init({
        idCategoriaBitacora: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        categoria: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'categoria_bitacoras',
        tableName: 'categoria_bitacoras',
        timestamps: true,
    });

    return categoria_bitacoras;
};
