'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class stands extends Model {
    static associate(models) {

    }
  }
  stands.init({
    idStand: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombreStand: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    estado: {
     type: DataTypes.INTEGER,
     allowNull: false
    },
    idSede: {
     type: DataTypes.INTEGER,
     allowNull: false
    },
    idTipoStands: {
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
    modelName: 'stands',
    tableName: 'stands',
    timestamps: true
  });

  return stands;
};
