// ! Modelo de horarios
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class horarios extends Model {
    static associate(models) {
      // * Relaciones
      horarios.hasMany(models.detalle_horarios, {
        foreignKey: 'idHorario',
        as: 'detalles'
      });
    }
  }

  horarios.init({
    idHorario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    horarioInicio: {
      type: DataTypes.TIME,
      allowNull: false
    },
    horarioFinal: {
      type: DataTypes.TIME,
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