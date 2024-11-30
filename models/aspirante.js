'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class aspirantes extends Model {
    static associate(models) {

      aspirantes.belongsTo(models.personas, {
        foreignKey: 'idPersona',
      });
    }
  }

  aspirantes.init({
    idAspirante: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    fechaRegistro: {
      type: DataTypes.DATEONLY,
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
    modelName: 'aspirantes',
    tableName: 'aspirantes',
    timestamps: true
  });

  return aspirantes;
};
