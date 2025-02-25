'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class stands extends Model {
    static associate(models) {
      // Relación con detalleStands
      this.hasMany(models.detalle_stands, {
        foreignKey: 'idStand',
        as: 'detallesStands'
      });
      // Relación con asignacion de stands
      this.hasMany(models.asignacion_stands, {
        foreignKey: 'idStand',
        as: 'asignaciones'
      });
      this.hasMany(models.detalle_ventas_stands, {
        foreignKey: 'idStand'
      });
      this.belongsTo(models.tipo_stands, {
        foreignKey: 'idTipoStands'
      });
      this.belongsTo(models.sedes, { 
        foreignKey: 'idSede' 
      });

      this.belongsTo(models.eventos, {
        foreignKey: 'idEvento',
      });

      stands.hasMany(models.stand_horarios, {
        foreignKey: 'idStand'
      });
      
    }
  }
  stands.init({
    idStand: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombreStand: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
      fechaInicio: {
        type: DataTypes.STRING,
        allowNull: true // Permitir valores nulos si es opcional
    },
    fechaFinal: {
        type: DataTypes.STRING,
        allowNull: true // Permitir valores nulos si es opcional
    },
    estado: {
     type: DataTypes.INTEGER,
     allowNull: false
    },
    idSede: {
     type: DataTypes.INTEGER,
     allowNull: false
    },
    idTipoStands: {
     type: DataTypes.INTEGER,
     allowNull: false
    },
    idEvento: { // Nuevo campo idEvento
      type: DataTypes.INTEGER,
      allowNull: false,
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
    modelName: 'stands',
    tableName: 'stands',
    timestamps: true
  });

  return stands;
};