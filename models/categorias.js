'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class categorias extends Model {
    static associate(models) {
       // Una categoría tiene muchos productos
        categorias.hasMany(models.productos, {
        foreignKey: 'idCategoria'
    });
    }
  }

  categorias.init({
    idCategoria: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombreCategoria: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'categorias',
    tableName: 'categorias',
    timestamps: true
  });

  return categorias;
};
