'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class voluntarios extends Model {
    static associate(models) {
        voluntarios.belongsTo(models.personas, {
            foreignKey: 'idPersona'
        });

        voluntarios.hasMany(models.solicitudTalonarios, {
          foreignKey: 'idVoluntario',
        });
        

      // Relación con inscripcionEventos
      voluntarios.hasMany(models.inscripcion_eventos, {
        foreignKey: 'idVoluntario',
        as: 'inscripciones'
      });

      // Relación con detalle de ventas de voluntarios
      voluntarios.hasMany(models.detalle_ventas_voluntarios, {
        foreignKey: 'idVoluntario'
      });

      // Relación con detalle de productos voluntarios
      voluntarios.hasMany(models.detalle_productos_voluntarios, {
        foreignKey: 'idVoluntario'
      });
    }
  }

  voluntarios.init({
    idVoluntario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    codigoQR: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fechaRegistro: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fechaSalida: {
        type: DataTypes.DATE,
        allowNull: true
    },
    estado: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idPersona: {
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
    modelName: 'voluntarios',
    tableName: 'voluntarios',
    timestamps: true
  });

  return voluntarios;
};