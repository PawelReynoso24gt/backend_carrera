'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class traslados extends Model {
    static associate(models) {
      traslados.belongsTo(models.TipoTraslado, {
        foreignKey: 'idTipoTraslado',
        as: 'tipoTraslado'
      });
      traslados.hasMany(models.detalle_traslados, {
        foreignKey: 'idTraslado'
      });
    }
  }

  traslados.init({
    idTraslado: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    fecha: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idTipoTraslado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'TipoTraslado',
        key: 'idTipoTraslado'
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
    modelName: 'traslados',
    tableName: 'traslados',
    timestamps: true
  });

  return traslados;
};
