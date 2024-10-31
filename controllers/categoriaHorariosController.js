'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const CATEGORIA_HORARIOS = db.categoria_horarios;

module.exports = {

    // * Listar todas las categorías de horarios
    async find_All(req, res) {
        return CATEGORIA_HORARIOS.findAll()
        .then((categorias) => {
            res.status(200).send(categorias);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las categorías de horarios.'
            });
        });
    },

    // * Listar todas las categorías de horarios activas
    async find_active(req, res) {
        return CATEGORIA_HORARIOS.findAll({
            where: {
                estado: 1 
            }
        })
        .then((categorias) => {
            res.status(200).send(categorias);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las categorías de horarios activas.'
            });
        });
    },

    // * Listar todas las categorías de horarios inactivas
    async find_inactive(req, res) {
        return CATEGORIA_HORARIOS.findAll({
            where: {
                estado: 0 
            }
        })
        .then((categorias) => {
            res.status(200).send(categorias);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las categorías de horarios inactivas.'
            });
        });
    },

    // * Crear una nueva categoría de horario
    async create(req, res) {
        const { categoria } = req.body;

        return CATEGORIA_HORARIOS.create({
            categoria,
            estado: 1
        })
        .then((categoriaHorario) => {
            res.status(201).send(categoriaHorario);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al crear la categoría de horario.'
            });
        });
    },

    // * Actualizar una categoría de horario
    async update(req, res) {
        const { idCategoriaHorario } = req.params;
        const { categoria } = req.body;

        return CATEGORIA_HORARIOS.update(
            { categoria },
            { where: { idCategoriaHorario } }
        )
        .then((affectedRows) => {
            if (affectedRows[0] === 0) {
                return res.status(404).send({ message: 'Categoría de horario no encontrada.' });
            }
            res.status(200).send({ message: 'Categoría de horario actualizada con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al actualizar la categoría de horario.'
            });
        });
    },

    // * Buscar una categoría de horario por nombre
    async find_categoria(req, res) {
        const { categoria } = req.params;

        return CATEGORIA_HORARIOS.findOne({
            where: {
                categoria: {
                    [Sequelize.Op.like]: `%${categoria}%` 
                }
            }
        })
        .then((categoriaHorario) => {
            if (!categoriaHorario) {
                return res.status(404).send({ message: 'Categoría de horario no encontrada.' });
            }
            res.status(200).send(categoriaHorario);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar la categoría de horario.'
            });
        });
    },

     // * Buscar una categoría de horario por ID
     async find_by_id(req, res) {
        const { idCategoriaHorario } = req.params;

        return CATEGORIA_HORARIOS.findByPk(idCategoriaHorario)
        .then((categoriaHorario) => {
            if (!categoriaHorario) {
                return res.status(404).send({ message: 'Categoría de horario no encontrada.' });
            }
            res.status(200).send(categoriaHorario);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar la categoría de horario por ID.'
            });
        });
    },

    // * Eliminar una categoría de horario por ID
    async delete(req, res) {
        const { idCategoriaHorario } = req.params;

        return CATEGORIA_HORARIOS.destroy({
            where: { idCategoriaHorario }
        })
        .then((deleted) => {
            if (deleted === 0) {
                return res.status(404).send({ message: 'Categoría de horario no encontrada.' });
            }
            res.status(200).send({ message: 'Categoría de horario eliminada con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al eliminar la categoría de horario.'
            });
        });
    }
};
