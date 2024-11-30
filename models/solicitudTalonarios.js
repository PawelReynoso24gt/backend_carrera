'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class solicitudTalonarios extends Model {
    static associate(models) {

      solicitudTalonarios.belongsTo(models.talonarios, {
        foreignKey: 'idTalonario',
      });

      solicitudTalonarios.belongsTo(models.voluntarios, {
        foreignKey: 'idVoluntario',
      });

      solicitudTalonarios.hasMany(models.recaudacionRifas, {
        foreignKey: 'idSolicitudTalonario',
      });
      
    }
  }

  solicitudTalonarios.init({
    idSolicitudTalonario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    fechaSolicitud: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    idTalonario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idVoluntario: {
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
    modelName: 'solicitudTalonarios',
    tableName: 'solicitud_talonarios',
    timestamps: true
  });

  return solicitudTalonarios;
};
