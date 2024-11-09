// ! Controlador de categorias
'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const CATEGORIAS = db.categorias;

module.exports = {

    // * Listar todas las categorías
    async findAll(req, res) {
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
    async findActive(req, res) {
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
    async findInactive(req, res) {
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
    
        if (!nombreCategoria) {
            return res.status(400).json({ message: 'Falta el campo requerido: nombreCategoria.' });
        }

        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

        if (!regex.test(nombreCategoria)) {
            return res.status(400).json({ message: 'El nombre de la categoría solo debe contener letras y espacios.' });
        }   
        
        try {

            const nuevaCategoria = await CATEGORIAS.create({
                nombreCategoria,
                estado: 1 
            });
    
            return res.status(201).json(nuevaCategoria);
    
        } catch (error) {
            console.error('Error al crear la categoría:', error);
            return res.status(500).json({
                message: error.message || 'Error al crear la categoría.'
            });
        }
    },

    // * Actualizar una categoría
    async update(req, res) {
        const datos = req.body;
        const id = req.params.id;
    
        const camposActualizados = {};

        if (datos.nombreCategoria !== undefined) {

            const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

            if (!regex.test(datos.nombreCategoria)) {
                return res.status(400).json({ message: 'La categoría solo debe contener letras y espacios.' });
            }

            camposActualizados.nombreCategoria = datos.nombreCategoria;
        }


        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
    
        try {    
            const [rowsUpdated] = await CATEGORIAS.update(camposActualizados, {
                where: { idCategoria: id }
            });
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Categoría de producto no encontrada' });
            }
            return res.status(200).json({ message: 'La categoría de producto ha sido actualizada' });
    
        } catch (error) {
            console.error(`Error al actualizar la categoría de producto con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar la categoría de producto' });
        }
    },


    // * Buscar una categoría por nombre
    async findCategoria(req, res) {
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
    async findById(req, res) {
        const { id } = req.params;

        return CATEGORIAS.findByPk(id)
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
