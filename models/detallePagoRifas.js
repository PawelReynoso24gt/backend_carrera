'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class detalle_pago_recaudacion_rifas extends Model {
    static associate(models) {
      // Relación con tipoPagos
      detalle_pago_recaudacion_rifas.belongsTo(models.tipo_pagos, {
        foreignKey: 'idTipoPago',
      });

      // Relación con recaudacionRifas
      detalle_pago_recaudacion_rifas.belongsTo(models.recaudacion_rifas, {
        foreignKey: 'idRecaudacionRifa',
      });
    }
  }

  detalle_pago_recaudacion_rifas.init({
    idDetallePagoRecaudacionRifa: {
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
      allowNull: false
    },
    imagenTransferencia: {
      type: DataTypes.TEXT('long'),
      allowNull: false
    },
    idTipoPago: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idRecaudacionRifa: {
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
    modelName: 'detalle_pago_recaudacion_rifas',
    tableName: 'detalle_pago_recaudacion_rifas',
    timestamps: true
  });

  return detalle_pago_recaudacion_rifas;
};
