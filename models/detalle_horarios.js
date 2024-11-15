// ! Modelo de detalle_horarios
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class detalle_horarios extends Model {
    static associate(models) {
      // * Relaciones
      detalle_horarios.belongsTo(models.horarios, {
        foreignKey: 'idHorario',
        as: 'horario'
      });
      detalle_horarios.belongsTo(models.categoria_horarios, {
        foreignKey: 'idCategoriaHorario',
        as: 'categoriaHorario'
      });
      // Relación con comisiones
      this.hasMany(models.comisiones, {
        foreignKey: 'idDetalleHorario',
        as: 'comisiones'
      });
    }
  }

  detalle_horarios.init({
    idDetalleHorario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    cantidadPersonas: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idHorario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'horarios',
        key: 'idHorario'
      }
    },
    idCategoriaHorario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categoria_horarios',
        key: 'idCategoriaHorario'
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
    modelName: 'detalle_horarios',
    tableName: 'detalle_horarios',
    timestamps: true
  });

  return detalle_horarios;
};