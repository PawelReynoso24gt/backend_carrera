'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class personas extends Model {
        static associate(models) {
            // Una persona pertenece a un municipio
            personas.belongsTo(models.municipios, {
                foreignKey: 'idMunicipio'
            });
            personas.hasMany(models.voluntarios, {
                foreignKey: 'idPersona'
            });
            personas.belongsTo(models.usuarios,{
                foreignKey: 'idPersona'
            });
            personas.hasMany(models.empleados, {
                foreignKey: 'idPersona'
            });            

            personas.hasMany(models.aspirantes, {
                foreignKey: 'idPersona',
            });

            // Relación con notificaciones
            personas.hasMany(models.notificaciones, {
                foreignKey: 'idPersona',
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
            type: DataTypes.STRING,
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
        foto: {
            type: DataTypes.TEXT,
            allowNull: false
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
