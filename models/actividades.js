'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class actividades extends Model {
        static associate(models) {
            // Relación con comisiones
            this.belongsTo(models.comisiones, {
                foreignKey: 'idComision',
                as: 'comision'
            });

            // relacion con inscripcion a actividades
            this.hasMany(models.detalle_inscripcion_actividades, {
                foreignKey: 'idActividad',
                as: 'detallesInscripcion'
            });            
        }
    }

    actividades.init({
        idActividad: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        actividad: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idComision: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }, 
    }, {
        sequelize,
        modelName: 'actividades',
        tableName: 'actividades',
        timestamps: true,
    });

    return actividades;
};
