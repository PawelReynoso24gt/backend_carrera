'use strict';

const db = require('../models');
const ASPIRANTES = db.aspirantes;

module.exports = {

    // * Listar todos los aspirantes
    async findAll(req, res) {
        return ASPIRANTES.findAll()
        .then((aspirantes) => {
            res.status(200).send(aspirantes);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los aspirantes.'
            });
        });
    },

    // * Listar todos los aspirantes activos
    async findActive(req, res) {
        return ASPIRANTES.findAll({
            where: {
                estado: 1
            }
        })
        .then((aspirantes) => {
            res.status(200).send(aspirantes);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los aspirantes activos.'
            });
        });
    },

    // * Listar todos los aspirantes inactivos
    async findInactive(req, res) {
        return ASPIRANTES.findAll({
            where: {
                estado: 0
            }
        })
        .then((aspirantes) => {
            res.status(200).send(aspirantes);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los aspirantes inactivos.'
            });
        });
    },

    // * Crear un nuevo aspirante
    async create(req, res) {
        const { fechaRegistro, idPersona } = req.body;

        if (!fechaRegistro) {
            return res.status(400).json({ message: 'Falta el campo requerido: fechaRegistro.' });
        }
        if (!idPersona) {
            return res.status(400).json({ message: 'Falta el campo requerido: idPersona.' });
        }

        try {
            const nuevoAspirante = await ASPIRANTES.create({
                fechaRegistro,
                idPersona,
                estado: 1
            });

            return res.status(201).json(nuevoAspirante);
        } catch (error) {
            console.error('Error al crear el aspirante:', error);
            return res.status(500).json({
                message: error.message || 'Error al crear el aspirante.'
            });
        }
    },

    // * Actualizar un aspirante
    async update(req, res) {
        const { idAspirante } = req.params;
        const { fechaRegistro, idPersona, estado } = req.body;

        const camposActualizados = {};

        if (fechaRegistro !== undefined) {
            camposActualizados.fechaRegistro = fechaRegistro;
        }

        if (idPersona !== undefined) {
            camposActualizados.idPersona = idPersona;
        }

        if (estado !== undefined) {
            camposActualizados.estado = estado;
        }

        try {
            const [rowsUpdated] = await ASPIRANTES.update(camposActualizados, {
                where: { idAspirante }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Aspirante no encontrado.' });
            }

            return res.status(200).json({ message: 'Aspirante actualizado con éxito.' });
        } catch (error) {
            console.error('Error al actualizar el aspirante:', error);
            return res.status(500).json({
                message: error.message || 'Error al actualizar el aspirante.'
            });
        }
    },

    // * Buscar un aspirante por ID
    async findById(req, res) {
        const { idAspirante } = req.params;

        return ASPIRANTES.findByPk(idAspirante)
        .then((aspirante) => {
            if (!aspirante) {
                return res.status(404).send({ message: 'Aspirante no encontrado.' });
            }
            res.status(200).send(aspirante);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar el aspirante por ID.'
            });
        });
    },

    // * Eliminar un aspirante por ID
    async delete(req, res) {
        const { idAspirante } = req.params;

        return ASPIRANTES.destroy({
            where: { idAspirante }
        })
        .then((deleted) => {
            if (deleted === 0) {
                return res.status(404).send({ message: 'Aspirante no encontrado.' });
            }
            res.status(200).send({ message: 'Aspirante eliminado con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al eliminar el aspirante.'
            });
        });
    }
};
