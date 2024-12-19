'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class detalle_ventas_stands extends Model {
        static associate(models) {
            detalle_ventas_stands.belongsTo(models.ventas, {
                foreignKey: 'idVenta'
            });
            detalle_ventas_stands.belongsTo(models.productos, {
                foreignKey: 'idProducto'
            });
            detalle_ventas_stands.hasMany(models.detalle_pago_ventas, {
                foreignKey: 'idDetalleVentaStand'
            });
        }
    }

    detalle_ventas_stands.init({
        idDetalleVentaStand: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        subTotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        donacion: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        estado: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        idVenta: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idProducto: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idStand: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'detalle_ventas_stands',
        tableName: 'detalle_ventas_stands',
        timestamps: true
    });

    return detalle_ventas_stands;
};