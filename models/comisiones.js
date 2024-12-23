'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class comisiones extends Model {
        static associate(models) {
           // Relación con eventos
            this.belongsTo(models.eventos, {
                foreignKey: 'idEvento',
                as: 'evento'
            });

        // Relación con detalle_horarios
            this.belongsTo(models.detalle_horarios, {
                foreignKey: 'idDetalleHorario',
                as: 'detalleHorario'
            }); 

            // Relación con actividades
            this.hasMany(models.actividades, {
                foreignKey: 'idComision',
                as: 'actividades'
            });
            
            // Relacion coninscripcion comision
            this.hasMany(models.inscripcion_comisiones, {
                foreignKey: 'idComision'
            });            
        }
    }

    comisiones.init({
        idComision: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        comision: {
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
        idEvento: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idDetalleHorario: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'comisiones',
        tableName: 'comisiones',
        timestamps: true,
    });

    return comisiones;
};
