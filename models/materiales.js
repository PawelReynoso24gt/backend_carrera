// ! Modelo de materiales
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class materiales extends Model {
    static associate(models) {
      // Relación con la tabla comisiones
      /*materiales.belongsTo(models.Comision, {
        foreignKey: 'idComision'
      });*/
    }
  }

  materiales.init({
    idMaterial: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    material: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idComision: {
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
    modelName: 'materiales',
    tableName: 'materiales',
    timestamps: true
  });

  return materiales;
};