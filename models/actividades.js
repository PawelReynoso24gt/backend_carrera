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
            // references: {
            //     model: 'comisiones', // Nombre de la tabla relacionada
            //     key: 'idComision'   // Llave primaria en comisiones
            // }
        }, 
    }, {
        sequelize,
        modelName: 'actividades',
        tableName: 'actividades',
        timestamps: true,
    });

    return actividades;
};
