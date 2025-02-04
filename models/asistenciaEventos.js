'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class asistenciaEventos extends Model {
        static associate(models) {
            // Relación con empleados
            this.belongsTo(models.empleados, {
                foreignKey: 'idEmpleado',
                as: 'empleado'
            });

            // Relación con inscripcionEventos
            this.belongsTo(models.inscripcion_eventos, {
                foreignKey: 'idInscripcionEvento',
                as: 'inscripcionEvento'
            });
        }
    }

    asistenciaEventos.init({
        idAsistenciaEvento: {
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
        },

        fechaHoraAsistencia: {
            type: DataTypes.DATE,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'asistencia_eventos',
        tableName: 'asistencia_eventos',
        timestamps: true, 
    });

    return asistenciaEventos;
};
