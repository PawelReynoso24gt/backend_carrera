'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class inscripcion_comisiones extends Model {
        static associate(models) {
            // Relación con comisiones
            this.belongsTo(models.comisiones, {
                foreignKey: 'idComision'
            });

            // Relación con voluntarios
            this.belongsTo(models.voluntarios, {
                foreignKey: 'idVoluntario'
            });
            
            // Relacion con inscripcion de actividades
            this.hasMany(models.detalle_inscripcion_actividades, {
                foreignKey: 'idInscripcionComision'
            });  
            
            // Relacion con inscripcion de materiales
            this.hasMany(models.detalle_inscripcion_materiales, {
                foreignKey: 'idInscripcionComision'
            });         
        }
    }

    inscripcion_comisiones.init({
        idInscripcionComision: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        idComision: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        idVoluntario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'inscripcion_comisiones',
        tableName: 'inscripcion_comisiones',
        timestamps: true, 
    });

    return inscripcion_comisiones;
};