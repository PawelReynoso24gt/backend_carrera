'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class detalle_pedidos extends Model {
    static associate(models) {
      // Relaciones
      detalle_pedidos.belongsTo(models.pedidos, {
        foreignKey: 'idPedido',
      });

      detalle_pedidos.belongsTo(models.productos, {
        foreignKey: 'idProducto',
      });
    }
  }

  detalle_pedidos.init(
    {
      idDetallePedido: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      estado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      idPedido: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'pedidos',
          key: 'idPedido',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      idProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'productos',
          key: 'idProducto',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'detalle_pedidos',
      tableName: 'detalle_pedidos',
      timestamps: true,
    }
  );

  return detalle_pedidos;
};
