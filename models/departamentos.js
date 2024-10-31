'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class departamentos extends Model {
    static associate(models) {
      // Un departamento tiene muchos municipios
        departamentos.hasMany(models.municipios, {
        foreignKey: 'idDepartamento'
      });
    }
  }

  departamentos.init({
    idDepartamento: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    departamento: {
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
    modelName: 'departamentos',
    tableName: 'departamentos',
    timestamps: true
  });

  return departamentos;
};
