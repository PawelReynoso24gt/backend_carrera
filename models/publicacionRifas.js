'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class publicacionRifas extends Model {
        static associate(models) {
            // * Una publicación general pertenece a una publicación
            publicacionRifas.belongsTo(models.publicaciones, {
                foreignKey: 'idPublicacion',
                as: 'publicacion'
            });

            // * Relación con rifas
            publicacionRifas.belongsTo(models.rifas, {
                foreignKey: 'idRifa',
                as: 'rifa'
            });
        }
    }

    publicacionRifas.init({
        idPublicacionRifa: {
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
        idRifa: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'publicacion_rifas',
        tableName: 'publicacion_rifas',
        timestamps: true,
    });

    return publicacionRifas;
};
