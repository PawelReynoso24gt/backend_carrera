// ! Controlador de eventos
'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const EVENTOS = db.eventos;
const SEDES = db.sedes;

module.exports = {

    // * Listar todos los eventos con el nombre de la sede
    async find_All(req, res) {
        return EVENTOS.findAll({
            include: [{
                model: SEDES,
                as: 'sede', 
                attributes: ['nombreSede'] 
            }]
        })
        .then((eventos) => {
            res.status(200).send(eventos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los eventos.'
            });
        });
    },

    // * Listar todos los eventos activos
    async find_active(req, res) {
        return EVENTOS.findAll({
            where: {
                estado: 1 
            },
            include: [{
                model: SEDES,
                as: 'sede',
                attributes: ['nombreSede']
            }]
        })
        .then((eventos) => {
            res.status(200).send(eventos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los eventos activos.'
            });
        });
    },

    // * Listar todos los eventos inactivos
    async find_inactive(req, res) {
        return EVENTOS.findAll({
            where: {
                estado: 0 
            },
            include: [{
                model: SEDES,
                as: 'sede',
                attributes: ['nombreSede']
            }]
        })
        .then((eventos) => {
            res.status(200).send(eventos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los eventos inactivos.'
            });
        });
    },

    // * Crear un nuevo evento
    async create(req, res) {
        const { nombreEvento, fechaHoraInicio, fechaHoraFin, descripcion, direccion, idSede } = req.body;

        return EVENTOS.create({
            nombreEvento,
            fechaHoraInicio,
            fechaHoraFin,
            descripcion,
            estado: 1,
            direccion,
            idSede 
        })
        .then((evento) => {
            res.status(201).send(evento);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al crear el evento.'
            });
        });
    },

    // * Actualizar un evento (el estado no se cambia aquí)
    async update(req, res) {
        const { idEvento } = req.params;
        const { nombreEvento, fechaHoraInicio, fechaHoraFin, descripcion, direccion, idSede } = req.body;

        return EVENTOS.update(
            { nombreEvento, fechaHoraInicio, fechaHoraFin, descripcion, direccion, idSede },
            { where: { idEvento } }
        )
        .then((affectedRows) => {
            if (affectedRows[0] === 0) {
                return res.status(404).send({ message: 'Evento no encontrado.' });
            }
            res.status(200).send({ message: 'Evento actualizado con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al actualizar el evento.'
            });
        });
    },

    // * Desactivar un evento
    async deactivate(req, res) {
        const { idEvento } = req.params;

        return EVENTOS.update(
            { estado: 0 }, 
            { where: { idEvento } }
        )
        .then((affectedRows) => {
            if (affectedRows[0] === 0) {
                return res.status(404).send({ message: 'Evento no encontrado.' });
            }
            res.status(200).send({ message: 'Evento desactivado con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al desactivar el evento.'
            });
        });
    },

    // * Activar un evento
    async activate(req, res) {
        const { idEvento } = req.params;

        return EVENTOS.update(
            { estado: 1 }, 
            { where: { idEvento } }
        )
        .then((affectedRows) => {
            if (affectedRows[0] === 0) {
                return res.status(404).send({ message: 'Evento no encontrado.' });
            }
            res.status(200).send({ message: 'Evento activado con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al activar el evento.'
            });
        });
    },

    // * Buscar un evento por nombre
    async find_evento(req, res) {
        const { nombreEvento } = req.params;

        return EVENTOS.findOne({
            where: {
                nombreEvento: {
                    [Sequelize.Op.like]: `%${nombreEvento}%` 
                }
            },
            include: [{
                model: SEDES,
                as: 'sede',
                attributes: ['nombreSede']
            }]
        })
        .then((evento) => {
            if (!evento) {
                return res.status(404).send({ message: 'Evento no encontrado.' });
            }
            res.status(200).send(evento);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar el evento.'
            });
        });
    }
};
