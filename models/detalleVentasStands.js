'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class detalleVentasStands extends Model {
    static associate(models) {
      // Relaciones
      detalleVentasStands.belongsTo(models.ventas, {
        foreignKey: 'idVenta',
      });

      detalleVentasStands.belongsTo(models.productos, {
        foreignKey: 'idProducto',
        as: 'producto'
            });

      detalleVentasStands.belongsTo(models.stands, {
        foreignKey: 'idStand',
                as: 'detalleVentas', 
      });
    }
  }

  detalleVentasStands.init(
    {
      idDetalleVentaStand: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      donacion: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      estado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      idVenta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ventas',
          key: 'idVenta',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      idStand: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'stands',
          key: 'idStand',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'detalleVentasStands',
      tableName: 'detalle_ventas_stands',
      timestamps: true,
    }
  );

  return detalleVentasStands;
};
