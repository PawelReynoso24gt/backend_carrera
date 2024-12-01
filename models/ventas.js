'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ventas extends Model {
        static associate(models){
            ventas.belongsTo(models.tipo_publicos, {
                foreignKey: 'idTipoPublico'
            });
            ventas.belongsTo(models.stands, {
                foreignKey: 'idStand'
            });
        }
    }

    ventas.init({
        idVenta: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        totalVenta: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        fechaVenta: {
            type: DataTypes.DATE,
            allowNull: false
        },
        estado: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        idTipoPublico: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        idStand: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW 
        }
    },{
        sequelize,
        modelName: 'ventas',
        tableName: 'ventas',
        timestamps: true
    });

    return ventas;

};