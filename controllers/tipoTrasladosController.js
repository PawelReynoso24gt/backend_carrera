'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const TIPO_TRASLADOS = db.TipoTraslado;

module.exports = {

    // * Listar todos los tipos de traslados
    async find_All(req, res) {
        return TIPO_TRASLADOS.findAll()
        .then((tipoTraslados) => {
            res.status(200).send(tipoTraslados);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los tipos de traslados.'
            });
        });
    },

    // * Listar todos los tipos de traslados activos
    async find_active(req, res) {
        return TIPO_TRASLADOS.findAll({
            where: {
                estado: 1 
            }
        })
        .then((tipoTraslados) => {
            res.status(200).send(tipoTraslados);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los tipos de traslados activos.'
            });
        });
    },

    // * Listar todos los tipos de traslados inactivos
    async find_inactive(req, res) {
        return TIPO_TRASLADOS.findAll({
            where: {
                estado: 0 
            }
        })
        .then((tipoTraslados) => {
            res.status(200).send(tipoTraslados);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los tipos de traslados inactivos.'
            });
        });
    },

    // * Crear un nuevo tipo de traslado
    async create(req, res) {
        const { tipo } = req.body;

        return TIPO_TRASLADOS.create({
            tipo,
            estado: 1 // Estado activo por defecto
        })
        .then((tipoTraslado) => {
            res.status(201).send(tipoTraslado);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al crear el tipo de traslado.'
            });
        });
    },

    // * Actualizar un tipo de traslado
    async update(req, res) {
        const { idTipoTraslado } = req.params;
        const { tipo } = req.body;

        return TIPO_TRASLADOS.update(
            { tipo },
            { where: { idTipoTraslado } }
        )
        .then((affectedRows) => {
            if (affectedRows[0] === 0) {
                return res.status(404).send({ message: 'Tipo de traslado no encontrado.' });
            }
            res.status(200).send({ message: 'Tipo de traslado actualizado con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al actualizar el tipo de traslado.'
            });
        });
    },


    // * Buscar un tipo de traslado por nombre
    async find_tipo(req, res) {
        const { tipo } = req.params;

        return TIPO_TRASLADOS.findOne({
            where: {
                tipo: {
                    [Sequelize.Op.like]: `%${tipo}%`
                }
            }
        })
        .then((tipoTraslado) => {
            if (!tipoTraslado) {
                return res.status(404).send({ message: 'Tipo de traslado no encontrado.' });
            }
            res.status(200).send(tipoTraslado);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar el tipo de traslado.'
            });
        });
    },

  // * Buscar un tipo de traslado por ID
async find_by_id(req, res) {
    const { idTipoTraslado } = req.params;

    return TIPO_TRASLADOS.findByPk(idTipoTraslado)
    .then((tipoTraslado) => {
        if (!tipoTraslado) {
            return res.status(404).send({ message: 'Tipo de traslado no encontrado.' });
        }
        res.status(200).send(tipoTraslado);
    })
    .catch((error) => {
        console.error('Error al buscar el tipo de traslado por ID:', error); // Agrega este log
        res.status(500).send({
            message: error.message || 'Error al buscar el tipo de traslado por ID.'
        });
    });
},

    // * Eliminar un tipo de traslado por ID
    async delete(req, res) {
        const { idTipoTraslado } = req.params;

        return TIPO_TRASLADOS.destroy({
            where: { idTipoTraslado }
        })
        .then((deleted) => {
            if (deleted === 0) {
                return res.status(404).send({ message: 'Tipo de traslado no encontrado.' });
            }
            res.status(200).send({ message: 'Tipo de traslado eliminado con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al eliminar el tipo de traslado.'
            });
        });
    }
};
