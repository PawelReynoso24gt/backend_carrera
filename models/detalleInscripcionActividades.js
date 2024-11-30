'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class detalleInscripcionActividades extends Model {
        static associate(models) {
            // Relación con inscripcionEventos
            this.belongsTo(models.inscripcion_eventos, {
                foreignKey: 'idInscripcionEvento',
                as: 'inscripcionEvento'
            });

            // Relación con comisiones
            this.belongsTo(models.comisiones, {
                foreignKey: 'idComision',
                as: 'comision'
            });

            // Relación con actividades
            this.belongsTo(models.actividades, {
                foreignKey: 'idActividad',
                as: 'actividad'
            });
        }
    }

    detalleInscripcionActividades.init({
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

        idComision: {
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

    return detalleInscripcionActividades;
};
