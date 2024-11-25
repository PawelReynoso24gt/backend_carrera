'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class voluntarios extends Model {
    static associate(models) {
        voluntarios.belongsTo(models.personas, {
            foreignKey: 'idPersona'
        });
    }
  }

  voluntarios.init({
    idVoluntario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    fechaRegistro: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fechaSalida: {
        type: DataTypes.DATE,
        allowNull: false
    },
    estado: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idPersona: {
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
    modelName: 'voluntarios',
    tableName: 'voluntarios',
    timestamps: true
  });

  return voluntarios;
};