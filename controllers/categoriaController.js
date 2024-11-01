// ! Controlador de categorias
'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const CATEGORIAS = db.categorias;

module.exports = {

    // * Listar todas las categorías
    async find_All(req, res) {
        return CATEGORIAS.findAll()
        .then((categorias) => {
            res.status(200).send(categorias);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las categorías.'
            });
        });
    },

    // * Listar todas las categorías activas
    async find_active(req, res) {
        return CATEGORIAS.findAll({
            where: {
                estado: 1 
            }
        })
        .then((categorias) => {
            res.status(200).send(categorias);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las categorías activas.'
            });
        });
    },

    // * Listar todas las categorías inactivas
    async find_inactive(req, res) {
        return CATEGORIAS.findAll({
            where: {
                estado: 0 
            }
        })
        .then((categorias) => {
            res.status(200).send(categorias);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las categorías inactivas.'
            });
        });
    },

    // * Crear una nueva categoría
    async create(req, res) {
        const { nombreCategoria } = req.body;

        return CATEGORIAS.create({
            nombreCategoria,
            estado: 1 // Estado activo por defecto
        })
        .then((categoria) => {
            res.status(201).send(categoria);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al crear la categoría.'
            });
        });
    },

    // * Actualizar una categoría
    async update(req, res) {
        const { idCategoria } = req.params;
        const { nombreCategoria } = req.body;

        return CATEGORIAS.update(
            { nombreCategoria },
            { where: { idCategoria } }
        )
        .then((affectedRows) => {
            if (affectedRows[0] === 0) {
                return res.status(404).send({ message: 'Categoría no encontrada.' });
            }
            res.status(200).send({ message: 'Categoría actualizada con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al actualizar la categoría.'
            });
        });
    },


    // * Buscar una categoría por nombre
    async find_categoria(req, res) {
        const { nombreCategoria } = req.params;

        return CATEGORIAS.findOne({
            where: {
                nombreCategoria: {
                    [Sequelize.Op.like]: `%${nombreCategoria}%`
                }
            }
        })
        .then((categoria) => {
            if (!categoria) {
                return res.status(404).send({ message: 'Categoría no encontrada.' });
            }
            res.status(200).send(categoria);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar la categoría.'
            });
        });
    },

    // * Buscar una categoría por ID
    async find_by_id(req, res) {
        const { idCategoria } = req.params;

        return CATEGORIAS.findByPk(idCategoria)
        .then((categoria) => {
            if (!categoria) {
                return res.status(404).send({ message: 'Categoría no encontrada.' });
            }
            res.status(200).send(categoria);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar la categoría por ID.'
            });
        });
    },

    // * Eliminar una categoría por ID
    async delete(req, res) {
        const { idCategoria } = req.params;

        return CATEGORIAS.destroy({
            where: { idCategoria }
        })
        .then((deleted) => {
            if (deleted === 0) {
                return res.status(404).send({ message: 'Categoría no encontrada.' });
            }
            res.status(200).send({ message: 'Categoría eliminada con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al eliminar la categoría.'
            });
        });
    }
};
