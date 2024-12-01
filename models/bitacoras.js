'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class bitacoras extends Model {
    static associate(models) {
      // Relaciones
      bitacoras.belongsTo(models.usuarios, {
        foreignKey: 'idUsuario',
      });

      bitacoras.belongsTo(models.categoria_bitacoras, {
        foreignKey: 'idCategoriaBitacora',
      });
    }
  }

  bitacoras.init(
    {
      idBitacora: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fechaHora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      idUsuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'idUsuario',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      idCategoriaBitacora: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'categorias_bitacoras',
          key: 'idCategoriaBitacora',
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
      modelName: 'bitacoras',
      tableName: 'bitacoras',
      timestamps: true,
    }
  );

  return bitacoras;
};
