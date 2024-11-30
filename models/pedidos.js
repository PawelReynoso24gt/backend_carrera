'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class pedidos extends Model {
    static associate(models) {
      pedidos.belongsTo(models.sedes, {
        foreignKey: 'idSede',
        as: 'sede'
      });

      pedidos.belongsTo(models.usuarios, {
        foreignKey: 'idUsuario',
        as: 'usuario'
      });
      pedidos.hasMany(models.detalle_pedidos, {
        foreignKey: 'idPedido'
      });
    }
  }

  pedidos.init({
    idPedido: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    idSede: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sedes',
        key: 'idSede'
      }
    },
    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'idUsuario'
      }
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
    modelName: 'pedidos',
    tableName: 'pedidos',
    timestamps: true
  });

  return pedidos;
};
