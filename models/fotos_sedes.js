// ! Modelo de fotos_sedes
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class fotos_sedes extends Model {
    static associate(models) {
      // * Relaciones
      fotos_sedes.belongsTo(models.sedes, {
        foreignKey: 'idSede',
        as: 'sede'
      });
    }
  }

  fotos_sedes.init({
    idFotoSede: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    foto: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idSede: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sedes',
        key: 'idSede'
      }
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
    modelName: 'fotos_sedes',
    tableName: 'fotos_sedes',
    timestamps: true
  });

  return fotos_sedes;
};