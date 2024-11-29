'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class talonarios extends Model {
    static associate(models) {
        talonarios.belongsTo(models.rifas, {
            foreignKey: 'idRifa'
        });

        talonarios.hasMany(models.solicitudTalonarios, {
          foreignKey: 'idTalonario',
        });
    }
  }

  talonarios.init({
    idTalonario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    codigoTalonario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cantidadBoletos: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    correlativoInicio: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    correlativoFinal: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estado: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idRifa: {
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
    modelName: 'talonarios',
    tableName: 'talonarios',
    timestamps: true
  });

  return talonarios;
};