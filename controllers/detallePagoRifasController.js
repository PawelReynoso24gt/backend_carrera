'use strict';

const db = require('../models');
const DETALLE_PAGO_RECAUDACION_RIFAS = db.detalle_pago_recaudacion_rifas;
const RECAUDACION_RIFAS = db.recaudacion_rifas;
const TIPO_PAGOS = db.tipo_pagos;

module.exports = {
    // * Listar todos los detalles de pago con datos de recaudación y tipo de pago
    async findAll(req, res) {
        return DETALLE_PAGO_RECAUDACION_RIFAS.findAll({
            include: [
                {
                    model: RECAUDACION_RIFAS,
                    attributes: ['idRecaudacionRifa', 'boletosVendidos', 'subTotal'],
                },
                {
                    model: TIPO_PAGOS,
                    attributes: ['idTipoPago', 'tipo']
                }
            ]
        })
        .then((detalles) => {
            res.status(200).send(detalles);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los detalles de pago.'
            });
        });
    },

    // * Listar todos los detalles de pago activos
    async findActive(req, res) {
        return DETALLE_PAGO_RECAUDACION_RIFAS.findAll({
            where: {
                estado: 1
            },
            include: [
                {
                    model: RECAUDACION_RIFAS,
                    attributes: ['idRecaudacionRifa', 'boletosVendidos', 'subTotal'],
                },
                {
                    model: TIPO_PAGOS,
                    attributes: ['idTipoPago', 'tipo']
                }
            ]
        })
        .then((detalles) => {
            res.status(200).send(detalles);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los detalles de pago activos.'
            });
        });
    },

    // * Listar todos los detalles de pago inactivos
    async findInactive(req, res) {
        return DETALLE_PAGO_RECAUDACION_RIFAS.findAll({
            where: {
                estado: 0
            },
            include: [
                {
                    model: RECAUDACION_RIFAS,
                    attributes: ['idRecaudacionRifa', 'boletosVendidos', 'subTotal'],
                },
                {
                    model: TIPO_PAGOS,
                    attributes: ['idTipoPago', 'tipo']
                }
            ]
        })
        .then((detalles) => {
            res.status(200).send(detalles);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los detalles de pago inactivos.'
            });
        });
    },

    // * Crear un nuevo detalle de pago
    async create(req, res) {
        const { pago, correlativo, imagenTransferencia, estado, idTipoPago, idRecaudacionRifa } = req.body;

        if (!pago || !correlativo || !imagenTransferencia || !idTipoPago || !idRecaudacionRifa) {
            return res.status(400).json({ message: 'Faltan campos requeridos: pago, correlativo, imagenTransferencia, idTipoPago o idRecaudacionRifa.' });
        }

        try {
            const nuevoDetalle = await DETALLE_PAGO_RECAUDACION_RIFAS.create({
                pago,
                correlativo,
                imagenTransferencia,
                estado: estado !== undefined ? estado : 1,
                idTipoPago,
                idRecaudacionRifa
            });

            return res.status(201).json(nuevoDetalle);
        } catch (error) {
            console.error('Error al crear el detalle de pago:', error);
            return res.status(500).json({
                message: error.message || 'Error al crear el detalle de pago.'
            });
        }
    },

    // * Actualizar un detalle de pago
    async update(req, res) {
        const { idDetallePagoRecaudacionRifa } = req.params;
        const { pago, correlativo, imagenTransferencia, estado, idTipoPago, idRecaudacionRifa } = req.body;

        try {
            const detalle = await DETALLE_PAGO_RECAUDACION_RIFAS.findByPk(idDetallePagoRecaudacionRifa);
            if (!detalle) {
                return res.status(404).json({ message: 'Detalle de pago no encontrado.' });
            }

            const updatedFields = {
                pago: pago !== undefined ? pago : detalle.pago,
                correlativo: correlativo !== undefined ? correlativo : detalle.correlativo,
                imagenTransferencia: imagenTransferencia !== undefined ? imagenTransferencia : detalle.imagenTransferencia,
                estado: estado !== undefined ? estado : detalle.estado,
                idTipoPago: idTipoPago || detalle.idTipoPago,
                idRecaudacionRifa: idRecaudacionRifa || detalle.idRecaudacionRifa
            };

            await detalle.update(updatedFields);

            return res.status(200).json({ message: 'Detalle de pago actualizado con éxito.', detalle });
        } catch (error) {
            console.error('Error al actualizar el detalle de pago:', error);
            return res.status(500).json({
                message: error.message || 'Error al actualizar el detalle de pago.'
            });
        }
    },

    // * Eliminar un detalle de pago
    async delete(req, res) {
        const { idDetallePagoRecaudacionRifa } = req.params;

        try {
            const detalle = await DETALLE_PAGO_RECAUDACION_RIFAS.findByPk(idDetallePagoRecaudacionRifa);
            if (!detalle) {
                return res.status(404).json({ message: 'Detalle de pago no encontrado.' });
            }

            await detalle.destroy();
            return res.status(200).json({ message: 'Detalle de pago eliminado con éxito.' });
        } catch (error) {
            console.error('Error al eliminar el detalle de pago:', error);
            return res.status(500).json({
                message: error.message || 'Error al eliminar el detalle de pago.'
            });
        }
    }
};
