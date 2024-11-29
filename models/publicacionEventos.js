'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class publicacionEventos extends Model {
        static associate(models) {
            // * Una publicación general pertenece a una publicación
            publicacionEventos.belongsTo(models.publicaciones, {
                foreignKey: 'idPublicacion',
                as: 'publicacion'
            });

            // * Relación con eventos
            publicacionEventos.belongsTo(models.eventos, {
                foreignKey: 'idEvento',
                as: 'evento'
            });
        }
    }

    publicacionEventos.init({
        idPublicacionEvento: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        foto: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idPublicacion: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }, 
        idEvento: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'publicacion_eventos',
        tableName: 'publicacion_eventos',
        timestamps: true,
    });

    return publicacionEventos;
};
