'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class publicaciones extends Model {
        static associate(models) {
            // * Una publicación pertenece a una sede
            publicaciones.belongsTo(models.sedes, {
                foreignKey: 'idSede',
                as: 'sede'
            });
        }
    }

    publicaciones.init({
        idPublicacion: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombrePublicacion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fechaPublicacion: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idSede: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }, 
    }, {
        sequelize,
        modelName: 'publicaciones',
        tableName: 'publicaciones',
        timestamps: true,
    });

    return publicaciones;
};
