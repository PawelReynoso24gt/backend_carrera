// ! Modelo de sedes
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class sedes extends Model {
    static associate(models) {
      // * Una sede tiene muchas rifas
      sedes.hasMany(models.rifas, {
        foreignKey: 'idSede'
      });
      // * Una sede tiene muchas fotos
      sedes.hasMany(models.fotos_sedes, {
        foreignKey: 'idSede',
        as: 'fotos'
      });
      // * Una sede tiene muchas publicaciones
      sedes.hasMany(models.publicaciones, {
        foreignKey: 'idSede',
        as: 'publicaciones'
      });
    }
  }

  sedes.init({
    idSede: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    informacion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombreSede: {
      type: DataTypes.STRING(255),
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
    modelName: 'sedes',
    tableName: 'sedes',
    timestamps: true
  });

  return sedes;
};