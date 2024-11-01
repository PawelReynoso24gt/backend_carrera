'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class usuarios extends Model {
    static associate(models) {
        // * Aqui van las relaciones
    }
  }

  usuarios.init({
    idUsuario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    usuario: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    contrasenia: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    token: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    tokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    estado: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idRol: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
    idSede: {
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
    modelName: 'usuarios',
    tableName: 'usuarios',
    timestamps: true
  });

  return usuarios;
};