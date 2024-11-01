'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const TRASLADOS = db.Traslado;
const TIPO_TRASLADOS = db.TipoTraslado;

module.exports = {

    // * Listar todos los traslados con el tipo de traslado
    async find_All(req, res) {
        return TRASLADOS.findAll({
            include: [{
                model: TIPO_TRASLADOS,
                as: 'tipoTraslado',
                attributes: ['tipo']
            }]
        })
        .then((traslados) => {
            res.status(200).send(traslados);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los traslados.'
            });
        });
    },

    // * Listar todos los traslados activos
    async find_active(req, res) {
        return TRASLADOS.findAll({
            where: {
                estado: 1
            },
            include: [{
                model: TIPO_TRASLADOS,
                as: 'tipoTraslado',
                attributes: ['tipo']
            }]
        })
        .then((traslados) => {
            res.status(200).send(traslados);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los traslados activos.'
            });
        });
    },

    // * Listar todos los traslados inactivos
    async find_inactive(req, res) {
        return TRASLADOS.findAll({
            where: {
                estado: 0 
            }
        })
        .then((traslados) => {
            res.status(200).send(traslados);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los traslados inactivos.'
            });
        });
    },


    // * Crear un nuevo traslado
    async create(req, res) {
        const { fecha, descripcion, idTipoTraslado } = req.body;

        return TRASLADOS.create({
            fecha,
            descripcion,
            estado: 1, // Activo por defecto
            idTipoTraslado
        })
        .then((traslado) => {
            res.status(201).send(traslado);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al crear el traslado.'
            });
        });
    },

    // * Actualizar un traslado
    async update(req, res) {
        const { idTraslado } = req.params;
        const { fecha, descripcion, idTipoTraslado } = req.body;

        return TRASLADOS.update(
            { fecha, descripcion, idTipoTraslado },
            { where: { idTraslado } }
        )
        .then((affectedRows) => {
            if (affectedRows[0] === 0) {
                return res.status(404).send({ message: 'Traslado no encontrado.' });
            }
            res.status(200).send({ message: 'Traslado actualizado con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al actualizar el traslado.'
            });
        });
    },

    // * Desactivar o activar un traslado
    async changeState(req, res) {
        const { idTraslado } = req.params;
    
        // Buscar el traslado actual para obtener su estado
        const traslado = await TRASLADOS.findByPk(idTraslado);
    
        if (!traslado) {
            return res.status(404).send({ message: 'Traslado no encontrado.' });
        }
    
        // Cambiar el estado: si es 1 (activo), cambiar a 0 (inactivo) y viceversa
        const nuevoEstado = traslado.estado === 1 ? 0 : 1;
    
        return TRASLADOS.update(
            { estado: nuevoEstado }, 
            { where: { idTraslado } }
        )
        .then((affectedRows) => {
            if (affectedRows[0] === 0) {
                return res.status(404).send({ message: 'Traslado no encontrado.' });
            }
            const mensaje = nuevoEstado === 1 
                ? 'Traslado activado con éxito.' 
                : 'Traslado desactivado con éxito.';
            res.status(200).send({ message: mensaje });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al cambiar el estado del traslado.'
            });
        });
    },
    
    // * Buscar un traslado por descripción
    async find_traslado(req, res) {
        const { descripcion } = req.params;

        return TRASLADOS.findOne({
            where: {
                descripcion: {
                    [Sequelize.Op.like]: `%${descripcion}%`
                }
            },
            include: [{
                model: TIPO_TRASLADOS,
                as: 'tipoTraslado',
                attributes: ['tipo']
            }]
        })
        .then((traslado) => {
            if (!traslado) {
                return res.status(404).send({ message: 'Traslado no encontrado.' });
            }
            res.status(200).send(traslado);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar el traslado.'
            });
        });
    },

     // * Buscar un traslado por ID
     async find_by_id(req, res) {
        const { idTraslado } = req.params;

        return TRASLADOS.findByPk(idTraslado, {
            include: [{
                model: TIPO_TRASLADOS,
                as: 'tipoTraslado',
                attributes: ['tipo']
            }]
        })
        .then((traslado) => {
            if (!traslado) {
                return res.status(404).send({ message: 'Traslado no encontrado.' });
            }
            res.status(200).send(traslado);
        })
        .catch((error) => {
            console.error('Error al buscar el traslado por ID:', error);
            res.status(500).send({
                message: error.message || 'Error al buscar el traslado por ID.'
            });
        });
    },

    // * Eliminar un traslado
    async delete(req, res) {
        const { idTraslado } = req.params;

        return TRASLADOS.destroy({
            where: { idTraslado }
        })
        .then((affectedRows) => {
            if (affectedRows === 0) {
                return res.status(404).send({ message: 'Traslado no encontrado.' });
            }
            res.status(200).send({ message: 'Traslado eliminado con éxito.' });
        })
        .catch((error) => {
            console.error('Error al eliminar el traslado:', error);
            res.status(500).send({
                message: error.message || 'Error al eliminar el traslado.'
            });
        });
    }
};
