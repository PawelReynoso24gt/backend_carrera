'use strict';

const db = require('../models');
const DETALLE_PAGO_VENTAS_STANDS = db.detalle_pago_ventas_stands;
const DETALLE_VENTAS_STANDS = db.detalle_ventas_stands;
const TIPOS_PAGO = db.tipo_pagos;

// Función para validar los datos de detalle_pago_ventas
function validateDetallePagoVentaData(datos) {
    if (datos.estado !== undefined) {
        if (datos.estado !== 0 && datos.estado !== 1) {
            return { error: 'El estado debe ser 0 o 1.' };
        }
    }

    if (datos.correlativo !== undefined && typeof datos.correlativo !== 'string') {
        return { error: 'El correlativo debe ser un texto válido.' };
    }

    if (datos.idDetalleVentaStand !== undefined) {
        if (isNaN(datos.idDetalleVentaStand) || datos.idDetalleVentaStand < 1) {
            return { error: 'El ID del detalle de venta debe ser un número válido.' };
        }
    }

    if (datos.idTipoPago !== undefined) {
        if (isNaN(datos.idTipoPago) || datos.idTipoPago < 1) {
            return { error: 'El ID del tipo de pago debe ser un número válido.' };
        }
    }

    // Verificar que al menos un campo esté presente para actualizaciones
    if (
        datos.estado === undefined &&
        datos.pago === undefined &&
        datos.imagenTransferencia === undefined &&
        datos.correlativo === undefined &&
        datos.idDetalleVentaStand === undefined &&
        datos.idTipoPago === undefined
    ) {
        return { error: 'Debe proporcionar al menos un campo para actualizar.' };
    }

    return null;
}

module.exports = {
    // Obtener todos los registros
    async findAll(req, res) {
        try {
            const pagos = await DETALLE_PAGO_VENTAS_STANDS.findAll({
                where:{ estado: 1 },
                include: [
                    {
                        model: DETALLE_VENTAS_STANDS,
                        attributes: ['idDetalleVentaStand', 'cantidad', 'subTotal', 'donacion', 'idVenta', 'idProducto', 'idStand']
                    },
                    {
                        model: TIPOS_PAGO,
                        attributes: ['tipo']
                    }
                ]
            });
            return res.status(200).send(pagos);
        } catch (error) {
            console.error('Error al recuperar los detalles de pago:', error);
            return res.status(500).send({ message: 'Ocurrió un error al recuperar los detalles de pago.' });
        }
    },

    // todos los de estado 1
    async findActive(req, res) {
        try {
            const pagos = await DETALLE_PAGO_VENTAS_STANDS.findAll({
                where:{ estado: 1 },
                include: [
                    {
                        model: DETALLE_VENTAS_STANDS,
                        attributes: ['idDetalleVentaStand', 'cantidad', 'subTotal', 'donacion', 'idVenta', 'idProducto', 'idStand']
                    },
                    {
                        model: TIPOS_PAGO,
                        attributes: ['tipo']
                    }
                ]
            });
            return res.status(200).send(pagos);
        } catch (error) {
            console.error('Error al recuperar los detalles de pago:', error);
            return res.status(500).send({ message: 'Ocurrió un error al recuperar los detalles de pago.' });
        }
    },

    // todos los de estado 0
    async findInactive(req, res) {
        try {
            const pagos = await DETALLE_PAGO_VENTAS_STANDS.findAll({
                where:{ estado: 0 },
                include: [
                    {
                        model: DETALLE_VENTAS_STANDS,
                        attributes: ['idDetalleVentaStand', 'cantidad', 'subTotal', 'donacion', 'idVenta', 'idProducto', 'idStand']
                    },
                    {
                        model: TIPOS_PAGO,
                        attributes: ['tipo']
                    }
                ]
            });
            return res.status(200).send(pagos);
        } catch (error) {
            console.error('Error al recuperar los detalles de pago:', error);
            return res.status(500).send({ message: 'Ocurrió un error al recuperar los detalles de pago.' });
        }
    },

    // Obtener un registro por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const pago = await DETALLE_PAGO_VENTAS_STANDS.findByPk(id, {
                include: [
                    {
                        model: DETALLE_VENTAS_STANDS,
                        attributes: ['idDetalleVentaStand', 'cantidad', 'subTotal', 'donacion', 'idVenta', 'idProducto', 'idStand']
                    },
                    {
                        model: TIPOS_PAGO,
                        attributes: ['tipo']
                    }
                ]
            });

            if (!pago) {
                return res.status(404).send({ message: 'Detalle de pago no encontrado.' });
            }

            return res.status(200).send(pago);
        } catch (error) {
            console.error('Error al recuperar el detalle de pago:', error);
            return res.status(500).send({ message: 'Ocurrió un error al recuperar el detalle de pago.' });
        }
    },

    // Crear un nuevo registro
    async create(req, res) {
        const datos = req.body;

        const error = validateDetallePagoVentaData(datos);
        if (error) {
            return res.status(400).send(error);
        }

        const nuevoDetallePagoVenta = {
            estado: datos.estado || 1,
            pago: datos.pago || 0.00,
            correlativo: datos.correlativo || 'NA',
            imagenTransferencia: datos.imagenTransferencia || 'NA',
            idDetalleVentaStand: datos.idDetalleVentaStand,
            idTipoPago: datos.idTipoPago
        };

        try {
            const detalleCreado = await DETALLE_PAGO_VENTAS_STANDS.create(nuevoDetallePagoVenta);
            return res.status(201).send(detalleCreado);
        } catch (error) {
            console.error('Error al crear el detalle de pago:', error);
            return res.status(500).send({ message: 'Ocurrió un error al crear el detalle de pago.' });
        }
    },

    // Actualizar un registro existente
    async update(req, res) {
        const id = req.params.id;
        const datos = req.body;

        const error = validateDetallePagoVentaData(datos);
        if (error) {
            return res.status(400).send(error);
        }

        const camposActualizados = {};

        if (datos.correlativo !== undefined) camposActualizados.correlativo = datos.correlativo;
        if (datos.pago !== undefined) camposActualizados.pago = datos.pago;
        if (datos.imagenTransferencia !== undefined) camposActualizados.imagenTransferencia = datos.imagenTransferencia;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
        if (datos.idDetalleVentaStand !== undefined) camposActualizados.idDetalleVentaStand = datos.idDetalleVentaStand;
        if (datos.idTipoPago !== undefined) camposActualizados.idTipoPago = datos.idTipoPago;

        try {
            const [rowsUpdated] = await DETALLE_PAGO_VENTAS_STANDS.update(camposActualizados, {
                where: { idDetallePagoVentaStand: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).send({ message: 'Detalle de pago no encontrado.' });
            }

            return res.status(200).send({ message: 'El detalle de pago ha sido actualizado exitosamente.' });
        } catch (error) {
            console.error('Error al actualizar el detalle de pago:', error);
            return res.status(500).send({ message: 'Ocurrió un error al actualizar el detalle de pago.' });
        }
    }
};