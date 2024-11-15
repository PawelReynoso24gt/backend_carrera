'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class personas extends Model {
        static associate(models) {
            // Una persona pertenece a un municipio
            personas.belongsTo(models.municipios, {
                foreignKey: 'idMunicipio'
            });
        }
    }

    personas.init({
        idPersona: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fechaNacimiento: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        domicilio: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        CUI: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        correo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idMunicipio: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'personas',
        tableName: 'personas',
        timestamps: true,
    });

    return personas;
};
