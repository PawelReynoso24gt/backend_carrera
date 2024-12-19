'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class detalle_inscripcion_materiales extends Model {
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

            // Relación con materiales
            this.belongsTo(models.materiales, {
                foreignKey: 'idMaterial',
                as: 'material'
            });
        }
    }

    detalle_inscripcion_materiales.init({
        idDetalleInscripcionMaterial: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        cantidadMaterial: {
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

        idMaterial: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'detalle_inscripcion_materiales',
        tableName: 'detalle_inscripcion_materiales',
        timestamps: true, 
    });

    return detalle_inscripcion_materiales;
};
