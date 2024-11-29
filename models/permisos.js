'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class permisos extends Model {
    static associate(models) {
      // Relación con modulos: cada permiso pertenece a un módulo
      permisos.hasMany(models.asignacion_permisos, {
        foreignKey: 'idPermiso'
       });

      permisos.belongsTo(models.modulos, {
        foreignKey: 'idModulo'
      });
    }
  }

  permisos.init({
    idPermiso: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombrePermiso: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
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
    },
    idModulo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'modulos', // Nombre de la tabla relacionada
        key: 'idModulo'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'permisos',
    tableName: 'permisos',
    timestamps: true
  });

  return permisos;
};
