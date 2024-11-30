'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const RECAUDACION_RIFAS = db.recaudacionRifas;
const SOLICITUD_TALONARIOS = db.solicitudTalonarios;

module.exports = {

    // * Listar todas las recaudaciones con los datos de la solicitud de talonario
    async findAll(req, res) {
        return RECAUDACION_RIFAS.findAll({
            include: [{
                model: SOLICITUD_TALONARIOS,
                attributes: ['idSolicitudTalonario', 'fechaSolicitud']
            }]
        })
        .then((recaudaciones) => {
            res.status(200).send(recaudaciones);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las recaudaciones.'
            });
        });
    },

    // * Listar todas las recaudaciones activas
    async findActive(req, res) {
        return RECAUDACION_RIFAS.findAll({
            where: {
                estado: 1
            },
            include: [{
                model: SOLICITUD_TALONARIOS,
                attributes: ['idSolicitudTalonario', 'fechaSolicitud']
            }]
        })
        .then((recaudaciones) => {
            res.status(200).send(recaudaciones);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las recaudaciones activas.'
            });
        });
    },

    // * Listar todas las recaudaciones inactivas
    async findInactive(req, res) {
        return RECAUDACION_RIFAS.findAll({
            where: {
                estado: 0
            },
            include: [{
                model: SOLICITUD_TALONARIOS,
                attributes: ['idSolicitudTalonario', 'fechaSolicitud']
            }]
        })
        .then((recaudaciones) => {
            res.status(200).send(recaudaciones);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las recaudaciones inactivas.'
            });
        });
    },

    async getByDate(req, res) {
        const { fecha } = req.params;
        const [day, month, year] = fecha.split('-');
        const formattedDate = `${year}-${month}-${day}`;
        try {
            const recaudaciones = await RECAUDACION_RIFAS.findAll({
                where: { createdAt: formattedDate }
            });
            return res.status(200).json(recaudaciones);
        } catch (error) {
            console.error(`Error al recuperar las recaudaciones de la fecha ${fecha}:`, error);
            return res.status(500).json({ message: 'Ocurrió un error al recuperar los datos.' });
        }
    },

    // * Crear una nueva recaudación
    async create(req, res) {
        const { boletosVendidos, estado, subTotal, idSolicitudTalonario } = req.body;

        if (!boletosVendidos || !idSolicitudTalonario || !subTotal) {
            return res.status(400).json({ message: 'Faltan campos requeridos: boletosVendidos, subTotal o idSolicitudTalonario.' });
        }

        try {
            const nuevaRecaudacion = await RECAUDACION_RIFAS.create({
                boletosVendidos,
                subTotal,
                estado: estado !== undefined ? estado : 1,
                idSolicitudTalonario
            });

            return res.status(201).json(nuevaRecaudacion);
        } catch (error) {
            console.error('Error al crear la recaudación:', error);
            return res.status(500).json({
                message: error.message || 'Error al crear la recaudación.'
            });
        }
    },

    // * Actualizar una recaudación
    async update(req, res) {
        const { idRecaudacionRifa } = req.params;
        const { boletosVendidos, estado, subTotal, idSolicitudTalonario } = req.body;

        try {
            const recaudacion = await RECAUDACION_RIFAS.findByPk(idRecaudacionRifa);
            if (!recaudacion) {
                return res.status(404).json({ message: 'Recaudación no encontrada.' });
            }

            const updatedFields = {
                boletosVendidos: boletosVendidos !== undefined ? boletosVendidos : recaudacion.boletosVendidos,
                subTotal: subTotal !== undefined ? subTotal : recaudacion.subTotal,
                estado: estado !== undefined ? estado : recaudacion.estado,
                idSolicitudTalonario: idSolicitudTalonario || recaudacion.idSolicitudTalonario
            };

            await recaudacion.update(updatedFields);

            return res.status(200).json({ message: 'Recaudación actualizada con éxito.', recaudacion });
        } catch (error) {
            console.error('Error al actualizar la recaudación:', error);
            return res.status(500).json({
                message: error.message || 'Error al actualizar la recaudación.'
            });
        }
    },

    // * Eliminar una recaudación
    async delete(req, res) {
        const { idRecaudacionRifa } = req.params;

        try {
            const recaudacion = await RECAUDACION_RIFAS.findByPk(idRecaudacionRifa);
            if (!recaudacion) {
                return res.status(404).json({ message: 'Recaudación no encontrada.' });
            }

            await recaudacion.destroy();
            return res.status(200).json({ message: 'Recaudación eliminada con éxito.' });
        } catch (error) {
            console.error('Error al eliminar la recaudación:', error);
            return res.status(500).json({
                message: error.message || 'Error al eliminar la recaudación.'
            });
        }
    }
};
