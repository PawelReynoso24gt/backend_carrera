// ! Controlador de Ventas
'use strict';

const { zonedTimeToUtc, format } = require('date-fns-tz');
const { parse, isValid } = require('date-fns'); // isValid para validar fechas
const db = require('../models');
const VENTAS = db.ventas;
const DETALLE_VENTAS_VOLUNTARIOS = db.detalle_ventas_voluntarios;
const DETALLE_PRODUCTOS_VOLUNTARIOS = db.detalle_productos_voluntarios;
const DETALLE_PAGO_VENTAS_VOLUNTARIOS = db.detalle_pago_ventas_voluntarios;
const VOLUNTARIOS = db.voluntarios;
const PRODUCTOS = db.productos;
const TIPO_PUBLICOS = db.tipo_publicos;

// Validación de entrada
function validateVentaData(datos) {
    const errors = [];

    // Validar idTipoPublico
    if (datos.idTipoPublico && (isNaN(datos.idTipoPublico) || datos.idTipoPublico < 1)) {
        errors.push('El tipo de público debe ser un número válido mayor a 0.');
    }

    // Validar estado
    if (datos.estado !== undefined && ![0, 1].includes(datos.estado)) {
        errors.push('El estado debe ser 0 o 1.');
    }

    return errors.length > 0 ? errors : null;
}

module.exports = {
    // * Obtener todas las ventas
    async findAll(req, res) {
        try {
            const ventas = await VENTAS.findAll({
                include: [
                    {
                        model: TIPO_PUBLICOS,
                        attributes: ['idTipoPublico', 'nombreTipo'],
                    },
                ],
                where: { estado: 1 },
            });

            return res.status(200).json(ventas);
        } catch (error) {
            console.error('Error al recuperar las ventas:', error);
            return res.status(500).json({ message: 'Error al recuperar las ventas.' });
        }
    },

    // * Obtener ventas activas
    async findActive(req, res) {
        try {
            const ventas = await VENTAS.findAll({
                include: [
                    {
                        model: TIPO_PUBLICOS,
                        attributes: ['idTipoPublico', 'nombreTipo'],
                    },
                ],
                where: { estado: 1 },
            });

            return res.status(200).json(ventas);
        } catch (error) {
            console.error('Error al recuperar las ventas activas:', error);
            return res.status(500).json({ message: 'Error al recuperar las ventas activas.' });
        }
    },

    // * Obtener ventas inactivas
    async findInactive(req, res) {
        try {
            const ventas = await VENTAS.findAll({
                include: [
                    {
                        model: TIPO_PUBLICOS,
                        attributes: ['idTipoPublico', 'nombreTipo'],
                    },
                ],
                where: { estado: 0 },
            });

            return res.status(200).json(ventas);
        } catch (error) {
            console.error('Error al recuperar las ventas inactivas:', error);
            return res.status(500).json({ message: 'Error al recuperar las ventas inactivas.' });
        }
    },

    // * Obtener una venta por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const venta = await VENTAS.findByPk(id, {
                include: [
                    {
                        model: TIPO_PUBLICOS,
                        attributes: ['idTipoPublico', 'nombreTipo'],
                    },
                ],
            });

            if (!venta) {
                return res.status(404).json({ message: 'Venta no encontrada.' });
            }

            return res.status(200).json(venta);
        } catch (error) {
            console.error('Error al recuperar la venta:', error);
            return res.status(500).json({ message: 'Error al recuperar la venta.' });
        }
    },

    // * Crear una nueva venta
    async create(req, res) {
        const datos = req.body;

        // Validar datos
        const validationErrors = validateVentaData(datos);
        if (validationErrors) {
            return res.status(400).json({ errors: validationErrors });
        }
        try {
            const nuevaVenta = await VENTAS.create({
                totalVenta: datos.totalVenta || 0.0,
                fechaVenta: new Date(),
                estado: datos.estado !== undefined ? datos.estado : 1,
                idTipoPublico: datos.idTipoPublico,
            });

            // Convertir fecha al formato UTC-6 para la respuesta
            const ventaConFormato = {
                ...nuevaVenta.toJSON(),
                fechaVenta: format(new Date(nuevaVenta.fechaVenta), "yyyy-MM-dd HH:mm:ss", {
                    timeZone: "America/Guatemala",
                }),
            };
    
                return res.status(201).json({
                message: "Venta creada con éxito",
                createdVenta: ventaConFormato,
            });
        } catch (error) {
            console.error('Error al crear la venta:', error);
            return res.status(500).json({ message: 'Error al crear la venta.' });
        }
    },

    // * Actualizar una venta
    async update(req, res) {
        const { totalVenta, fechaVenta, estado, idTipoPublico } = req.body;
        const id = req.params.id;
    
        const camposActualizados = {};
    
        // Validar y asignar campos actualizados
        if (totalVenta !== undefined) camposActualizados.totalVenta = totalVenta;
        if (fechaVenta !== undefined) camposActualizados.fechaVenta = fechaVenta;
        if (estado !== undefined) camposActualizados.estado = estado;
    
        if (idTipoPublico !== undefined) {
            const tipoPublicoExistente = await TIPO_PUBLICOS.findByPk(idTipoPublico);
            if (!tipoPublicoExistente) {
                return res.status(400).json({ message: 'El tipo de público especificado no existe.' });
            }
            camposActualizados.idTipoPublico = idTipoPublico;
        }
    
        try {
            // Actualizar los campos en la base de datos
            const [rowsUpdated] = await VENTAS.update(camposActualizados, {
                where: { idVenta: id },
            });
    
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Venta no encontrada.' });
            }
    
            // Recuperar la venta actualizada
            const ventaActualizada = await VENTAS.findByPk(id, {
                include: [
                    {
                        model: TIPO_PUBLICOS,
                        attributes: ['idTipoPublico', 'nombreTipo'],
                    },
                ],
            });
    
            // Formatear la fecha para la respuesta
            const ventaConFormato = {
                ...ventaActualizada.toJSON(),
                fechaVenta: format(new Date(ventaActualizada.fechaVenta), "yyyy-MM-dd HH:mm:ss", {
                    timeZone: "America/Guatemala",
                }),
            };
    
            return res.status(200).json({
                message: `La venta con ID: ${id} ha sido actualizada`,
                updatedVenta: ventaConFormato,
            });
        } catch (error) {
            console.error(`Error al actualizar la venta con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar la venta.' });
        }
    }, 
    
    // * VENTA COMPLETA POR VOLUNTARIOS
    async createFullVenta(req, res) {
        const { venta, detalles, pagos } = req.body;

        // Validar datos
        if (!venta || !detalles || !pagos) {
            return res.status(400).json({ message: "Faltan datos para crear la venta." });
        }

        const transaction = await db.sequelize.transaction(); // Transacción para asegurar atomicidad

        try {
            // Crear la venta principal
            const nuevaVenta = await VENTAS.create(
                {
                    totalVenta: venta.totalVenta,
                    fechaVenta: new Date(),
                    estado: venta.estado || 1,
                    idTipoPublico: venta.idTipoPublico || 2,
                },
                { transaction }
            );

            const idVenta = nuevaVenta.idVenta;

            // Crear detalles de venta y almacenar sus IDs
            const detallesVentaIds = [];

            for (const detalle of detalles) {
                const producto = await DETALLE_PRODUCTOS_VOLUNTARIOS.findOne({
                    where: { idProducto: detalle.idProducto },
                });

                if (!producto || producto.cantidad < detalle.cantidad) {
                    throw new Error(`El producto con ID ${detalle.idProducto} no tiene suficiente inventario.`);
                }

                // Restar inventario al producto
                await producto.update(
                    { cantidad: producto.cantidad - detalle.cantidad },
                    { transaction }
                );

                // Crear detalle de venta
                const nuevoDetalleVenta = await DETALLE_VENTAS_VOLUNTARIOS.create(
                    {
                        idVenta,
                        idProducto: detalle.idProducto,
                        cantidad: detalle.cantidad,
                        subTotal: detalle.subtotal,
                        donacion: detalle.donacion || 0,
                        estado: detalle.estado || 1, // Asegurar que el estado esté presente
                        idVoluntario: detalle.idVoluntario, // Asegurar que se incluya el ID del voluntario
                    },
                    { transaction }
                );

                // Almacenar el ID del detalle de venta
                detallesVentaIds.push({
                    idProducto: detalle.idProducto,
                    idDetalleVentaVoluntario: nuevoDetalleVenta.idDetalleVentaVoluntario,
                });
            }

            // Crear detalles de pagos
            for (const pago of pagos) {
                const detalleVenta = detallesVentaIds.find(
                    (detalle) => detalle.idProducto === pago.idProducto
                );

                if (!detalleVenta) {
                    throw new Error(
                        `No se encontró un detalle de venta para el producto con ID ${pago.idProducto}.`
                    );
                }

                let correlativo = pago.correlativo || "NA"; // Por defecto, NA
                let imagenTransferencia = pago.imagenTransferencia || "efectivo"; // Por defecto, efectivo

                // Verifica si el tipo de pago requiere correlativo e imagen
                if ([1, 2, 4].includes(pago.idTipoPago)) { // Depósito, Transacción, Cheque
                    if (!pago.correlativo || !pago.imagenTransferencia) {
                        throw new Error(
                            `El tipo de pago ${pago.idTipoPago} requiere correlativo e imagen.`
                        );
                    }
                    correlativo = pago.correlativo;
                    imagenTransferencia = pago.imagenTransferencia;
                } else if (pago.idTipoPago === 3) { // Efectivo
                    correlativo = "NA";
                    imagenTransferencia = "efectivo";
                }

                // Crear el registro del detalle del pago
                await DETALLE_PAGO_VENTAS_VOLUNTARIOS.create(
                    {
                        idDetalleVentaVoluntario: detalleVenta.idDetalleVentaVoluntario, // Asociar automáticamente
                        idTipoPago: pago.idTipoPago,
                        pago: pago.monto,
                        correlativo: correlativo,
                        imagenTransferencia: imagenTransferencia,
                        estado: pago.estado || 1, // Por defecto activo
                    },
                    { transaction }
                );
            }

            await transaction.commit(); // Confirmar la transacción
            return res.status(201).json({ message: "Venta creada con éxito.", venta: nuevaVenta });
        } catch (error) {
            await transaction.rollback(); // Revertir cambios en caso de error
            console.error("Error al crear la venta:", error);
            return res.status(500).json({ message: "Error al crear la venta.", error: error.message });
        }
    },

    // * buscar el detalle de ventas
    async findByVentaId(req, res) {
        const idVenta = req.params.idVenta;
    
        try {
            const detalles = await DETALLE_VENTAS_VOLUNTARIOS.findAll({
                where: { idVenta },
                include: [
                    {
                        model: VENTAS,
                        attributes: ['idVenta', 'totalVenta', 'fechaVenta'],
                    },
                    {
                        model: PRODUCTOS,
                        attributes: ['idProducto', 'nombreProducto', 'precio'],
                    },
                    {
                        model: VOLUNTARIOS,
                        as: 'voluntario',
                        attributes: ['idVoluntario', 'idPersona', 'codigoQR'],
                        include: [
                            {
                                model: db.personas,
                                as: 'persona',
                                attributes: ['idPersona', 'nombre', 'telefono', 'domicilio'],
                            },
                        ],
                    },
                    {
                        model: db.detalle_pago_ventas_voluntarios, // Relación con pagos
                        as: 'detalle_pago_ventas_voluntarios',
                        attributes: ['idTipoPago', 'pago', 'correlativo', 'imagenTransferencia', 'estado'],
                        include: [
                            {
                                model: db.tipo_pagos,
                                attributes: ['idTipoPago', 'tipo'], // Incluye el tipo de pago
                            },
                        ],
                    },
                ],
            });
    
            if (!detalles || detalles.length === 0) {
                return res.status(404).send({ message: 'No se encontraron detalles para esta venta.' });
            }
    
            return res.status(200).send(detalles);
        } catch (error) {
            console.error('Error al recuperar los detalles de la venta:', error);
            return res.status(500).send({ message: 'Error al recuperar los detalles de la venta.', error: error.message });
        }
    },    
};
