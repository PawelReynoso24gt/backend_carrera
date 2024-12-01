'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class detalle_productos extends Model {
    static associate(models) {
      // Relaciones
      detalle_productos.belongsTo(models.sedes, {
        foreignKey: 'idSede',
      });

      detalle_productos.belongsTo(models.productos, {
        foreignKey: 'idProducto',
      });
    }
  }

  detalle_productos.init(
    {
      idDetalleProductos: {
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
      idSede: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'sedes',
          key: 'idSede',
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
      modelName: 'detalle_productos',
      tableName: 'detalle_productos',
      timestamps: true,
    }
  );

  return detalle_productos;
};
