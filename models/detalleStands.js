'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class detalleStands extends Model {
        static associate(models) {
            // Relación con productos
            this.belongsTo(models.productos, {
                foreignKey: 'idProducto',
                as: 'producto'
            });

            // Relación con stands
            this.belongsTo(models.stands, {
                foreignKey: 'idStand',
                as: 'detallesStands'
            });
        }
    }

    detalleStands.init({
        idDetalleStands: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        idProducto: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        idStand: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'detalle_stands',
        tableName: 'detalle_stands',
        timestamps: true, 
    });

    return detalleStands;
};
