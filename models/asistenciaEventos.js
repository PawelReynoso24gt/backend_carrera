'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class asistenciaEventos extends Model {
        static associate(models) {
            
        }
    }

    asistenciaEventos.init({
        idDetalleInscripcionActividad: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        idInscripcionEvento: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        idEmpleado: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'asistencia_eventos',
        tableName: 'asistencia_eventos',
        timestamps: true, 
    });

    return asistenciaEventos;
};
