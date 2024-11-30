'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class modulos extends Model {
    static associate(models) {
      // Relación uno a muchos con permisos
      modulos.hasMany(models.permisos, {
        foreignKey: 'idModulo',
        as: 'permisos'
      });
    }
  }

  modulos.init({
    idModulo: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombreModulo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
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
    modelName: 'modulos',
    tableName: 'modulos',
    timestamps: true
  });

  return modulos;
};
