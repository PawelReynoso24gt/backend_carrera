'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class permisos extends Model {
    static associate(models) {
      permisos.hasMany(models.asignacion_permisos, {
        foreignKey: 'idPermiso'
      });
    }
  }

  permisos.init({
    idPermiso: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombrePermiso: {
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
    modelName: 'permisos',
    tableName: 'permisos',
    timestamps: true
  });

  return permisos;
};
