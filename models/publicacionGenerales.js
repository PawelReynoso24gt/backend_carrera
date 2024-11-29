'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class publicacionGenerales extends Model {
        static associate(models) {
            // * Una publicación general pertenece a una publicación
            publicacionGenerales.belongsTo(models.publicaciones, {
                foreignKey: 'idPublicacion',
                as: 'publicacion'
            });
        }
    }

    publicacionGenerales.init({
        idPublicacionGeneral: {
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
    }, {
        sequelize,
        modelName: 'publicacion_generales',
        tableName: 'publicacion_generales',
        timestamps: true,
    });

    return publicacionGenerales;
};
