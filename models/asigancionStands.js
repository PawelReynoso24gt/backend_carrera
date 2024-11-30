'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class asignacionStands extends Model {
        static associate(models) {
            // Relación con inscripcionEventos
            this.belongsTo(models.inscripcion_eventos, {
                foreignKey: 'idInscripcionEvento',
                as: 'inscripcionEvento'
            });

            // Relación con detalle_horarios
            this.belongsTo(models.detalle_horarios, {
                foreignKey: 'idDetalleHorario',
                as: 'detalleHorario'
            });

            // Relación con stands
            this.belongsTo(models.stands, {
                foreignKey: 'idStand',
                as: 'stand'
            });
        }
    }

    asignacionStands.init({
        idAsignacionStands: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        idInscripcionEvento: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        idStand: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        idDetalleHorario: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'asignacion_stands',
        tableName: 'asignacion_stands',
        timestamps: true, 
    });

    return asignacionStands;
};
