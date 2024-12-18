'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class rifas extends Model {
        static associate(models) {
             // * Una rifa pertenece a una sede
                rifas.belongsTo(models.sedes, {
                foreignKey: 'idSede'
            });
                rifas.hasMany(models.talonarios, {
                foreignKey: 'idRifa'
            });
            // * Relación con publicaciones de rifas (nueva)
            rifas.hasMany(models.publicacion_rifas, {
                foreignKey: 'idRifa',
                as: 'publicacionesRifas'
            });
        }
    }

    rifas.init({
        idRifa: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreRifa: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        precioBoleto: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        idSede: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'rifas',
        tableName: 'rifas',
        timestamps: true,
    });

    return rifas;
};
