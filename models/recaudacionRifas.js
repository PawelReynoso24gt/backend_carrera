'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class recaudacionRifas extends Model {
    static associate(models) {
      // Relación con solicitudTalonarios
      recaudacionRifas.belongsTo(models.solicitudTalonarios, {
        foreignKey: 'idSolicitudTalonario',
      });
    }
  }

  recaudacionRifas.init({
    idRecaudacionRifa: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    boletosVendidos: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    idSolicitudTalonario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'recaudacionRifas',
    tableName: 'recaudacion_rifas',
    timestamps: true
  });

  return recaudacionRifas;
};
