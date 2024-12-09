'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class notificaciones extends Model {
        static associate(models) {
            // Relación con bitacoras
            notificaciones.belongsTo(models.bitacoras, {
                foreignKey: 'idBitacora',
            });

            // Relación con tipo_notificaciones
            notificaciones.belongsTo(models.tipo_notificaciones, {
                foreignKey: 'idTipoNotificacion',
            });

            // Relación con personas
            notificaciones.belongsTo(models.personas, {
                foreignKey: 'idPersona',
            });
        }
    }

    notificaciones.init({
        idNotificacion: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        fechaHora: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        idBitacora: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        idTipoNotificacion: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        idPersona: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        estado: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'notificaciones',
        tableName: 'notificaciones',
        timestamps: true,
    });

    return notificaciones;
};
