// ! Controlador de sedes
'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const SEDES = db.sedes;

module.exports = {

     // * Listar todas las sedes
    async find_All(req, res) {
        return SEDES.findAll({
        })
        .then((sedes) => {
            res.status(200).send(sedes);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las sedes.'
            });
        });
    },

    // * Listar todas las sedes activas
    async find_active(req, res) {
        return SEDES.findAll({
            where: {
                estado: 1 
            }
        })
        .then((sedes) => {
            res.status(200).send(sedes);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las sedes.'
            });
        });
    },

    // * Listar todas las sedes inactivas
    async find_inactive(req, res) {
        return SEDES.findAll({
            where: {
                estado: 0 
            }
        })
        .then((sedes) => {
            res.status(200).send(sedes);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las sedes.'
            });
        });
    },

    
    // * Crear una nueva sede con estado 1 
    async create(req, res) {
        const { informacion, nombreSede } = req.body;

        return SEDES.create({
            informacion,
            nombreSede,
            estado: 1
        })
        .then((sede) => {
            res.status(201).send(sede);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al crear la sede.'
            });
        });
    },

    // * Actualizar los campos de una sede (el estado no se cambia aqui)
    async update(req, res) {
        const { idSede } = req.params;
        const { informacion, nombreSede } = req.body;

        return SEDES.update(
            { informacion, nombreSede },
            { where: { idSede } }
        )
        .then((affectedRows) => {
            if (affectedRows[0] === 0) {
                return res.status(404).send({ message: 'Sede no encontrada.' });
            }
            res.status(200).send({ message: 'Sede actualizada con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al actualizar la sede.'
            });
        });
    },

     // * Desactivar una sede
    async deactivate(req, res) {
        const { idSede } = req.params;

        return SEDES.update(
            { estado: 0 }, 
            { where: { idSede } }
        )
        .then((affectedRows) => {
            if (affectedRows[0] === 0) {
                return res.status(404).send({ message: 'Sede no encontrada.' });
            }
            res.status(200).send({ message: 'Sede desactivada con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al desactivar la sede.'
            });
        });
    },


     // * Activar una sede
    async activate(req, res) {
        const { idSede } = req.params;

        return SEDES.update(
            { estado: 1 }, 
            { where: { idSede } }
        )
        .then((affectedRows) => {
            if (affectedRows[0] === 0) {
                return res.status(404).send({ message: 'Sede no encontrada.' });
            }
            res.status(200).send({ message: 'Sede activada con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al activar la sede.'
            });
        });
    },

    // * Buscar una sede por nombre
    async find_sede(req, res) {
        const { nombreSede } = req.params;

        return SEDES.findOne({
            where: {
                nombreSede: {
                    [Sequelize.Op.like]: `%${nombreSede}%` 
                }
            }
        })
        .then((sede) => {
            if (!sede) {
                return res.status(404).send({ message: 'Sede no encontrada.' });
            }
            res.status(200).send(sede);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar la sede.'
            });
        });
    }

};
