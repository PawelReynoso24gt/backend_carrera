'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class eventos extends Model {
    static associate(models) {
      this.belongsTo(models.sedes, {
        foreignKey: 'idSede',
        as: 'sede'
      });

      // Relación con comisiones
      this.hasMany(models.comisiones, {
        foreignKey: 'idEvento',
        as: 'comisiones'
      });

      // Relación con publicacion de eventos
      this.hasMany(models.publicacion_eventos, {
        foreignKey: 'idEvento',
        as: 'publicacionesEventos'
      });
    }
  }

  eventos.init({
    idEvento: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombreEvento: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fechaHoraInicio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fechaHoraFin: {
      type: DataTypes.DATE,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING(255),
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
    modelName: 'eventos',
    tableName: 'eventos',
    timestamps: true, 
  });

  return eventos;
};
