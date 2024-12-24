'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tipo_situaciones extends Model {
    static associate(models) {
        tipo_situaciones.hasMany(models.situaciones, {
            foreignKey: 'idTipoSituacion'
        });
    }
  }

  tipo_situaciones.init({
    idTipoSituacion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    tipoSituacion: {
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
    modelName: 'tipo_situaciones',
    tableName: 'tipo_situaciones',
    timestamps: true
  });

  return tipo_situaciones;
};
