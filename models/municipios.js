'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class municipios extends Model {
    static associate(models) {
      // Un municipio tiene muchas personas
      municipios.hasMany(models.personas, {
        foreignKey: 'idMunicipio'
      });

      // Un municipio pertenece a un departamento
      municipios.belongsTo(models.departamentos, {
        foreignKey: 'idDepartamento'
      });
    }
  }
  municipios.init({
    idMunicipio: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    municipio: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    estado: {
     type: DataTypes.INTEGER,
     allowNull: false
    },
    idDepartamento: {
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
    modelName: 'municipios',
    tableName: 'municipios',
    timestamps: true
  });

  return municipios;
};
