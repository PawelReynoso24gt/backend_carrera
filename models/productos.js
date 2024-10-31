'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class productos extends Model {
        static associate(models) {
            // Un producto pertenece a una categoría
            productos.belongsTo(models.categorias, {
                foreignKey: 'idCategoria'
            });
        }
    }

    productos.init({
        idProducto: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        talla: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        nombreProducto: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cantidadMinima: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cantidadMaxima: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        idCategoria: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        estado: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'productos',
        tableName: 'productos',
        timestamps: true,
    });

    return productos;
};
