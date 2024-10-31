'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TipoTraslado extends Model {
    static associate(models) {
      // Relación con la tabla traslados
      TipoTraslado.hasMany(models.Traslado, {
        foreignKey: 'idTipoTraslado',
        as: 'traslados'
      });
    }
  }

  TipoTraslado.init({
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
    modelName: 'TipoTraslado', // Cambia esto a CamelCase
    tableName: 'tipo_traslados',
    timestamps: true
  });

  return TipoTraslado;
};
