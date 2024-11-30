'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class inscripcionEventos extends Model {
        static associate(models) {
            // Relación con eventos
            this.belongsTo(models.eventos, {
                foreignKey: 'idEvento',
                as: 'evento'
            });

            // Relación con voluntarios
            this.belongsTo(models.voluntarios, {
                foreignKey: 'idVoluntario',
                as: 'voluntario'
            });

            // Relación con asigancion de stands
            this.hasMany(models.asignacion_stands, {
                foreignKey: 'idInscripcionEvento',
                as: 'asignaciones'
            });
            
            // Relacion con inscripcion de actividades
            this.hasMany(models.detalle_inscripcion_actividades, {
                foreignKey: 'idInscripcionEvento',
                as: 'actividadesInscripcion'
            });  
            
            // Relacion con inscripcion de materiales
            this.hasMany(models.detalle_inscripcion_materiales, {
                foreignKey: 'idInscripcionEvento',
                as: 'materialesInscripcion' // Alias único
            });           
        }
    }

    inscripcionEventos.init({
        idInscripcionEvento: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        fechaHoraInscripcion: {
            type: DataTypes.DATE,
            allowNull: false
        },

        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        idVoluntario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        idEvento: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'inscripcion_eventos',
        tableName: 'inscripcion_eventos',
        timestamps: true, 
    });

    return inscripcionEventos;
};
