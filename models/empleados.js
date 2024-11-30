'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class empleados extends Model {
    static associate(models) {
        // Relación con personas
            this.belongsTo(models.personas, {
                foreignKey: 'idPersona',
                as: 'persona'
            });

        // Relación con asistencia a eventos
            this.hasMany(models.asistencia_eventos, {
                foreignKey: 'idEmpleado',
                as: 'asistencias'
            });        
        }
    }

    empleados.init({
    idEmpleado: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    fechaRegistro: {
        type: DataTypes.DATE,
        allowNull: false
    },
    fechaSalida: {
        type: DataTypes.DATE,
        allowNull: false
    },
    estado: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idPersona: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
    }, {
    sequelize,
    modelName: 'empleados',
    tableName: 'empleados',
    timestamps: true
    });

    return empleados;
};