'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class recaudacion_eventos extends Model {
    static associate(models) {
      // Relaciones
      recaudacion_eventos.belongsTo(models.eventos, {
        foreignKey: 'idEvento',
      });

      recaudacion_eventos.belongsTo(models.empleados, {
        foreignKey: 'idEmpleado',
      });
    }
  }

  recaudacion_eventos.init(
    {
      idRecaudacionEvento: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      recaudacion: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      estado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      fechaRegistro: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      idEvento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'eventos',
          key: 'idEvento',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      idEmpleado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'empleados',
          key: 'idEmpleado',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'recaudacion_eventos',
      tableName: 'recaudacion_eventos',
      timestamps: true,
    }
  );

  return recaudacion_eventos;
};