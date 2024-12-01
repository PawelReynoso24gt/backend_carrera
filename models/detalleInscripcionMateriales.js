'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class detalleInscripcionMateriales extends Model {
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

            // Relación con materiales
            this.belongsTo(models.materiales, {
                foreignKey: 'idMaterial',
                as: 'material'
            });
        }
    }

    detalleInscripcionMateriales.init({
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

        idComision: {
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

    return detalleInscripcionMateriales;
};
