'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class detalle_inscripcion_actividades extends Model {
        static associate(models) {
            // Relación con inscripcionComisiones
            this.belongsTo(models.inscripcion_comisiones, {
                foreignKey: 'idInscripcionComision'
            });

            // Relación con inscripcionEventos
            this.belongsTo(models.inscripcion_eventos, {
                foreignKey: 'idInscripcionEvento',
                as: 'inscripcionEvento'
            });

            // Relación con actividades
            this.belongsTo(models.actividades, {
                foreignKey: 'idActividad',
                as: 'actividad'
            });
        }
    }

    detalle_inscripcion_actividades.init({
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

        idInscripcionComision: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        idActividad: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'detalle_inscripcion_actividades',
        tableName: 'detalle_inscripcion_actividades',
        timestamps: true, 
    });

    return detalle_inscripcion_actividades;
};
