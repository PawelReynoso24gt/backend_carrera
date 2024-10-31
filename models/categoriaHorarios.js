'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class categoria_horarios extends Model {
    static associate(models) {
      // * Aquí van las relaciones si son necesarias
    }
  }

  categoria_horarios.init({
    idCategoriaHorario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    categoria: {
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
    modelName: 'categoria_horarios',
    tableName: 'categoria_horarios',
    timestamps: true
  });

  return categoria_horarios;
};
