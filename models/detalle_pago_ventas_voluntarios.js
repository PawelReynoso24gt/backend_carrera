'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class detalle_pago_ventas_voluntarios extends Model {
        static associate(models) {
            detalle_pago_ventas_voluntarios.belongsTo(models.detalle_ventas_voluntarios, {
                foreignKey: 'idDetalleVentaVoluntario'
            });
            detalle_pago_ventas_voluntarios.belongsTo(models.tipo_pagos, {
                foreignKey: 'idTipoPago'
            });
        }
    }

    detalle_pago_ventas_voluntarios.init({
        idDetallePagoVentaVoluntario: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        estado: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        pago: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        correlativo: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        imagenTransferencia: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        idDetalleVentaVoluntario: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idTipoPago: {
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
        modelName: 'detalle_pago_ventas_voluntarios',
        tableName: 'detalle_pago_ventas_voluntarios',
        timestamps: true
    });

    return detalle_pago_ventas_voluntarios;
};