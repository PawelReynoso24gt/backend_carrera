'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class asignacion_permisos extends Model {
    static associate(models) {
      asignacion_permisos.belongsTo(models.roles, {
        foreignKey: 'idRol'
      });
      asignacion_permisos.belongsTo(models.permisos, {
        foreignKey: 'idPermiso'
      });
    }
  }

  asignacion_permisos.init({
    idAsignacion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    idRol: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idPermiso: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    modelName: 'asignacion_permisos',
    tableName: 'asignacion_permisos',
    timestamps: true
  });

  return asignacion_permisos;
};
