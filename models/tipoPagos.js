'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tipo_pagos extends Model {
    static associate(models) {
      tipo_pagos.hasMany(models.detalle_pago_recaudacion_rifas, {
        foreignKey: 'idTipoPago',
      });
      tipo_pagos.hasMany(models.detalle_pago_ventas_stands, {
        foreignKey: 'idTipoPago'
      });
      tipo_pagos.hasMany(models.detalle_pago_ventas_voluntarios, {
        foreignKey: 'idTipoPago'
      });
    }
  }

  tipo_pagos.init({
    idTipoPago: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    tipo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    estado: {
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
    modelName: 'tipo_pagos',
    tableName: 'tipo_pagos',
    timestamps: true
  });

  return tipo_pagos;
};
