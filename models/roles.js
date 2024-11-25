'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class roles extends Model {
    static associate(models) {
      roles.hasMany(models.usuarios, {
        foreignKey: 'idRol'
      });
    }
  }

  roles.init({
    idRol: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    roles: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    estado: {
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
    modelName: 'roles',
    tableName: 'roles',
    timestamps: true
  });

  return roles;
};