'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class tipoNotificacion extends Model {
        static associate(models) {
            // Relación con notificaciones
            tipoNotificacion.hasMany(models.notificaciones, {
                foreignKey: 'idTipoNotificacion',
            });
        }
    }

    tipoNotificacion.init({
        idTipoNotificacion: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        tipoNotificacion: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'tipo_notificaciones',
        tableName: 'tipo_notificaciones',
        timestamps: true
    });

    return tipoNotificacion;
};