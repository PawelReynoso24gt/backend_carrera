'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class stand_horarios extends Model {
    static associate(models) {
      // Relación con stands
      this.belongsTo(models.stands, {
        foreignKey: 'idStand',
      });
      // Relación con detalle_horarios
      this.belongsTo(models.detalle_horarios, {
        foreignKey: 'idDetalleHorario',
      });
    }
  }

  stand_horarios.init(
    {
      idStandHorario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      idStand: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'stands',
          key: 'idStand',
        },
      },
      idDetalleHorario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'detalle_horarios',
          key: 'idDetalleHorario',
        },
      },
      estado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
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
      modelName: 'stand_horarios',
      tableName: 'stand_horarios',
      timestamps: true,
    }
  );

  return stand_horarios;
};
