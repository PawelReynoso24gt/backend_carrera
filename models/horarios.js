// ! Modelo de horarios
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class horarios extends Model {
    static associate(models) {
        // * Aqui van las relaciones
    }
  }

  horarios.init({
    idHorario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    horarioInicio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    horarioFinal: {
      type: DataTypes.DATE,
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
    modelName: 'horarios',
    tableName: 'horarios',
    timestamps: true
  });

  return horarios;
};