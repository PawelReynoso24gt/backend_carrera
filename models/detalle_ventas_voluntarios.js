'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class detalle_ventas_voluntarios extends Model {
        static associate(models) {
            detalle_ventas_voluntarios.belongsTo(models.ventas, {
                foreignKey: 'idVenta'
            });
            detalle_ventas_voluntarios.belongsTo(models.productos, {
                foreignKey: 'idProducto'
            });
            detalle_ventas_voluntarios.belongsTo(models.voluntarios, {
                foreignKey: 'idVoluntario'
            });
            detalle_ventas_voluntarios.hasMany(models.detalle_pago_ventas_voluntarios, {
                foreignKey: 'idDetalleVentaVoluntario'
            });
        }
    }

    detalle_ventas_voluntarios.init({
        idDetalleVentaVoluntario: {
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
            allowNull: false,
            defaultValue: 0.00
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
        idVoluntario: {
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
        modelName: 'detalle_ventas_voluntarios',
        tableName: 'detalle_ventas_voluntarios',
        timestamps: true
    });

    return detalle_ventas_voluntarios;
};