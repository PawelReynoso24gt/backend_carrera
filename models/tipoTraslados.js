'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tipo_traslados extends Model {
    static associate(models) {
      // Relación con la tabla traslados
      tipo_traslados.hasMany(models.Traslado, {
        foreignKey: 'idTipoTraslado',
        as: 'traslados'
      });
    }
  }

  tipo_traslados.init({
    idTipoTraslado: {
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
    modelName: 'tipo_traslados',
    tableName: 'tipo_traslados',
    timestamps: true
  });

  return tipo_traslados;
};
