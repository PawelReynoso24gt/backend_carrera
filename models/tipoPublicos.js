'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class tipo_publicos extends Model {
        static associate(models) {
            tipo_publicos.hasMany(models.ventas, {
                foreignKey: 'idTipoPublico'
            });
        }
    }

    tipo_publicos.init({
        idTipoPublico: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreTipo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'tipo_publicos',
        tableName: 'tipo_publicos',
        timestamps: true,
    });

    return tipo_publicos;
};
