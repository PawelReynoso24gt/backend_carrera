'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class situaciones extends Model {
    static associate(models) {
        situaciones.belongsTo(models.tipo_situaciones, {
            foreignKey: 'idTipoSituacion'
        });

        situaciones.belongsTo(models.usuarios, {
            foreignKey: 'idUsuario'
        });
    }
  }

  situaciones.init({
    idSituacion: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    fechaOcurrencia: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    idTipoSituacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idUsuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    respuesta: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    observaciones: {
        type: DataTypes.STRING,
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
    modelName: 'situaciones',
    tableName: 'situaciones',
    timestamps: true
  });

  return situaciones;
};
