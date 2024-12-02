'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class detalle_traslados extends Model {
    static associate(models) {
     
      detalle_traslados.belongsTo(models.traslados, {
        foreignKey: 'idTraslado'
      });

      detalle_traslados.belongsTo(models.productos, {
        foreignKey: 'idProducto'
      });
    }
  }

  detalle_traslados.init({
    idDetalleTraslado: {
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
      allowNull: false,
      defaultValue: 1
    },
    idTraslado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'traslados', 
        key: 'idTraslado'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    idProducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos', 
        key: 'idProducto'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
    modelName: 'detalle_traslados',
    tableName: 'detalle_traslados', 
    timestamps: true
  });

  return detalle_traslados;
};
