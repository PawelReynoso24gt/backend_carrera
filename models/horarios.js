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
      type: DataTypes.STRING, // se usará como STRING por el hecho que esta como TIME en la BD
      allowNull: false
    },
    horarioFinal: {
      type: DataTypes.STRING,
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