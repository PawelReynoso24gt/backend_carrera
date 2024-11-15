'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const CATEGORIA_HORARIOS = db.categoria_horarios;

module.exports = {

    // * Listar todas las categorías de horarios
    async findAll(req, res) {
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
    async findActive(req, res) {
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
    async findInactive(req, res) {
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
        const datos = req.body;
    
        if (!datos.categoria) {
            return res.status(400).json({ message: 'Falta el campo requerido: categoria.' });
        }

        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

        if (!regex.test(datos.categoria)) {
            return res.status(400).json({ message: 'El nombre de la categoría solo debe contener letras y espacios.' });
        }
        
        try {

            const datos_ingreso = { 
                categoria: datos.categoria,
                estado: datos.estado !== undefined ? datos.estado : 1
            };
    
            const categoriaHorarioCreado = await CATEGORIA_HORARIOS.create(datos_ingreso);
            return res.status(201).json(categoriaHorarioCreado);
    
        } catch (error) {
            console.error('Error al crear la categoría de horario:', error);
            return res.status(500).json({ error: 'Error al crear la categoría de horario.' });
        }
    },
    

    // * Actualizar una categoría de horario
    async update (req, res) {
        const datos = req.body;
        const id = req.params.id;
    
        const camposActualizados = {};

        if (datos.categoria !== undefined) {

            const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

            if (!regex.test(datos.categoria)) {
                return res.status(400).json({ message: 'La categoría horario solo debe contener letras y espacios.' });
            }

            camposActualizados.categoria = datos.categoria;
        }

        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
    
        try {    
            const [rowsUpdated] = await CATEGORIA_HORARIOS.update(camposActualizados, {
                where: { idCategoriaHorario: id }
            });
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Categoría de horario no encontrada' });
            }
            return res.status(200).json({ message: 'La categoría de horario ha sido actualizada' });
    
        } catch (error) {
            console.error(`Error al actualizar la categoría de horario con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar la categoría de horario' });
        }
    },
    

    // * Buscar una categoría de horario por nombre
    async findCategoria(req, res) {
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
     async findById(req, res) {
        const { id } = req.params;

        return CATEGORIA_HORARIOS.findByPk(id)
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
