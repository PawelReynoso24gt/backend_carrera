'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class detalle_productos_voluntarios extends Model {
        static associate(models) {
            // Relación con productos
            this.belongsTo(models.productos, {
                foreignKey: 'idProducto',
            });

            // Relación con voluntarios
            this.belongsTo(models.voluntarios, {
                foreignKey: 'idVoluntario'
            });
        }
    }

    detalle_productos_voluntarios.init({
        idDetalleProductoVoluntario: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        idProducto: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        idVoluntario: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        }

    }, {
        sequelize,
        modelName: 'detalle_productos_voluntarios',
        tableName: 'detalle_productos_voluntarios',
        timestamps: true, 
    });

    return detalle_productos_voluntarios;
};
