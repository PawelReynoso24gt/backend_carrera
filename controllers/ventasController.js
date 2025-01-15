// ! Controlador de Ventas
'use strict';

const { zonedTimeToUtc, format } = require('date-fns-tz');
const { parse, isValid } = require('date-fns'); // isValid para validar fechas
const db = require('../models');
const VENTAS = db.ventas;
const DETALLE_VENTAS_VOLUNTARIOS = db.detalle_ventas_voluntarios;
const DETALLE_PRODUCTOS_VOLUNTARIOS = db.detalle_productos_voluntarios;
const DETALLE_PAGO_VENTAS_VOLUNTARIOS = db.detalle_pago_ventas_voluntarios;
const DETALLE_VENTAS_STANDS = db.detalle_ventas_stands;
const DETALLE_STANDS = db.detalle_stands;
const DETALLE_PAGO_VENTAS_STANDS = db.detalle_pago_ventas_stands;
const VOLUNTARIOS = db.voluntarios;
const STANDS = db.stands;
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

    async findAllVoluntarios(req, res) {
        try {
            const ventas = await VENTAS.findAll({
                include: [
                    {
                        model: DETALLE_VENTAS_VOLUNTARIOS, // Relación con detalles de ventas de voluntarios
                        as: 'detalle_ventas_voluntarios',
                        include: [
                            {
                                model: VOLUNTARIOS, // Información del voluntario
                                as: 'voluntario',
                                attributes: ['idVoluntario', 'codigoQR'],
                                include: [
                                    {
                                        model: db.personas,
                                        as: 'persona',
                                        attributes: ['idPersona', 'nombre', 'telefono', 'domicilio'],
                                    },
                                ],
                            },
                            {
                                model: PRODUCTOS, // Productos vendidos
                                attributes: ['idProducto', 'nombreProducto', 'precio', 'descripcion', 'foto', 'talla'],
                            },
                        ],
                    },
                    {
                        model: TIPO_PUBLICOS, // Tipo de público
                        attributes: ['idTipoPublico', 'nombreTipo'],
                    },
                ],
                where: { estado: 1 }, // Solo ventas activas
            });

            // Filtrar ventas que tienen detalles en detalle_ventas_voluntarios
            const ventasConDetalles = ventas.filter(
                venta => venta.detalle_ventas_voluntarios && venta.detalle_ventas_voluntarios.length > 0
            );

            return res.status(200).json(ventasConDetalles);
        } catch (error) {
            console.error('Error al recuperar las ventas:', error);
            return res.status(500).json({ message: 'Error al recuperar las ventas.' });
        }
    },

    // * Obtener todas las ventas de stands
    async findAllVentasStands(req, res) {
        try {
            const ventas = await VENTAS.findAll({
                include: [
                    {
                        model: DETALLE_VENTAS_STANDS, // Relación con detalles de ventas de stands
                        as: 'detalle_ventas_stands',
                        include: [
                            {
                                model: STANDS, // Relación con el stand asociado
                                attributes: ['idStand', 'nombreStand', 'direccion'],
                                include: [
                                    {
                                        model: db.tipo_stands, // Tipo de stand
                                        attributes: ['idTipoStands', 'tipo'],
                                    },
                                ],
                            },
                            {
                                model: PRODUCTOS, // Información del producto vendido
                                attributes: ['idProducto', 'nombreProducto', 'precio', 'descripcion', 'foto', 'talla'],
                            },
                        ],
                    },
                    {
                        model: TIPO_PUBLICOS, // Tipo de público relacionado con la venta
                        attributes: ['idTipoPublico', 'nombreTipo'],
                    },
                ],
                where: { estado: 1 }, // Solo ventas activas
            });

            // Filtrar ventas que sí tengan detalle_ventas_stands
            const ventasConDetalles = ventas.filter(venta => venta.detalle_ventas_stands && venta.detalle_ventas_stands.length > 0);

            return res.status(200).json(ventasConDetalles);
        } catch (error) {
            console.error('Error al recuperar las ventas de stands:', error);
            return res.status(500).json({ message: 'Error al recuperar las ventas de stands.' });
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

    // * Obtener ventas activas de voluntarios
    async findActiveVoluntarios(req, res) {
        try {
            const ventas = await VENTAS.findAll({
                include: [
                    {
                        model: DETALLE_VENTAS_VOLUNTARIOS, // Relación con detalles de ventas de voluntarios
                        as: 'detalle_ventas_voluntarios',
                        include: [
                            {
                                model: VOLUNTARIOS, // Información del voluntario
                                as: 'voluntario',
                                attributes: ['idVoluntario', 'codigoQR'],
                                include: [
                                    {
                                        model: db.personas,
                                        as: 'persona',
                                        attributes: ['idPersona', 'nombre', 'telefono', 'domicilio'],
                                    },
                                ],
                            },
                            {
                                model: PRODUCTOS, // Productos vendidos
                                attributes: ['idProducto', 'nombreProducto', 'precio', 'descripcion', 'foto', 'talla'],
                            },
                        ],
                    },
                    {
                        model: TIPO_PUBLICOS, // Tipo de público
                        attributes: ['idTipoPublico', 'nombreTipo'],
                    },
                ],
                where: { estado: 1 }, // Solo ventas activas
            });

            // Filtrar ventas que tienen detalles en detalle_ventas_voluntarios
            const ventasConDetalles = ventas.filter(
                venta => venta.detalle_ventas_voluntarios && venta.detalle_ventas_voluntarios.length > 0
            );

            return res.status(200).json(ventasConDetalles);
        } catch (error) {
            console.error('Error al recuperar las ventas activas:', error);
            return res.status(500).json({ message: 'Error al recuperar las ventas activas.' });
        }
    },

    // * Obtener ventas activas de stands
    async findActiveVentasStands(req, res) {
        try {
            const ventas = await VENTAS.findAll({
                include: [
                    {
                        model: DETALLE_VENTAS_STANDS,
                        as: 'detalle_ventas_stands',
                        include: [
                            {
                                model: STANDS,
                                attributes: ['idStand', 'nombreStand', 'direccion'],
                                include: [
                                    {
                                        model: db.tipo_stands,
                                        attributes: ['idTipoStands', 'tipo'],
                                    },
                                ],
                            },
                            {
                                model: PRODUCTOS,
                                attributes: ['idProducto', 'nombreProducto', 'precio', 'descripcion', 'foto', 'talla'],
                            },
                        ],
                    },
                    {
                        model: TIPO_PUBLICOS,
                        attributes: ['idTipoPublico', 'nombreTipo'],
                    },
                ],
                where: { estado: 1 }, // Filtra solo ventas activas
            });

            // Filtrar ventas que sí tengan detalle_ventas_stands
            const ventasConDetalles = ventas.filter(venta => venta.detalle_ventas_stands && venta.detalle_ventas_stands.length > 0);

            return res.status(200).json(ventasConDetalles);
        } catch (error) {
            console.error('Error al recuperar las ventas activas de stands:', error);
            return res.status(500).json({ message: 'Error al recuperar las ventas activas de stands.' });
        }
    },

    // * Obtener ventas inactivas de voluntarios
    async findInactiveVoluntarios(req, res) {
        try {
            const ventas = await VENTAS.findAll({
                include: [
                    {
                        model: DETALLE_VENTAS_VOLUNTARIOS, // Relación con detalles de ventas de voluntarios
                        as: 'detalle_ventas_voluntarios',
                        include: [
                            {
                                model: VOLUNTARIOS, // Información del voluntario
                                as: 'voluntario',
                                attributes: ['idVoluntario', 'codigoQR'],
                                include: [
                                    {
                                        model: db.personas,
                                        as: 'persona',
                                        attributes: ['idPersona', 'nombre', 'telefono', 'domicilio'],
                                    },
                                ],
                            },
                            {
                                model: PRODUCTOS, // Productos vendidos
                                attributes: ['idProducto', 'nombreProducto', 'precio', 'descripcion', 'foto', 'talla'],
                            },
                        ],
                    },
                    {
                        model: TIPO_PUBLICOS, // Tipo de público
                        attributes: ['idTipoPublico', 'nombreTipo'],
                    },
                ],
                where: { estado: 0 }, // Solo ventas inactivas
            });

            // Filtrar ventas que tienen detalles en detalle_ventas_voluntarios
            const ventasConDetalles = ventas.filter(
                venta => venta.detalle_ventas_voluntarios && venta.detalle_ventas_voluntarios.length > 0
            );

            return res.status(200).json(ventasConDetalles);
        } catch (error) {
            console.error('Error al recuperar las ventas inactivas:', error);
            return res.status(500).json({ message: 'Error al recuperar las ventas inactivas.' });
        }
    },

    // * Obtener ventas inactivas de stands
    async findInactiveVentasStands(req, res) {
        try {
            const ventas = await VENTAS.findAll({
                include: [
                    {
                        model: DETALLE_VENTAS_STANDS,
                        as: 'detalle_ventas_stands',
                        include: [
                            {
                                model: STANDS,
                                attributes: ['idStand', 'nombreStand', 'direccion'],
                                include: [
                                    {
                                        model: db.tipo_stands,
                                        attributes: ['idTipoStands', 'tipo'],
                                    },
                                ],
                            },
                            {
                                model: PRODUCTOS,
                                attributes: ['idProducto', 'nombreProducto', 'precio', 'descripcion', 'foto', 'talla'],
                            },
                        ],
                    },
                    {
                        model: TIPO_PUBLICOS,
                        attributes: ['idTipoPublico', 'nombreTipo'],
                    },
                ],
                where: { estado: 0 }, // Filtra solo ventas inactivas
            });

            // Filtrar ventas que sí tengan detalle_ventas_stands
            const ventasConDetalles = ventas.filter(venta => venta.detalle_ventas_stands && venta.detalle_ventas_stands.length > 0);

            return res.status(200).json(ventasConDetalles);
        } catch (error) {
            console.error('Error al recuperar las ventas inactivas de stands:', error);
            return res.status(500).json({ message: 'Error al recuperar las ventas inactivas de stands.' });
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

    // * Actualizar una venta (para el estado)
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

         // Validar que los detalles tengan los campos requeridos
        for (const detalle of detalles) {
            if (!detalle.idProducto || detalle.cantidad <= 0 || !detalle.subTotal) {
                throw new Error(`El detalle de venta es inválido: ${JSON.stringify(detalle)}`);
            }
        }
        
        // Validar que la suma de pagos y donación coincida con el total de la venta
        const totalPagado = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
        if (totalPagado !== parseFloat(venta.totalVenta)) {
            return res.status(400).json({
                message: `La suma de los montos de los pagos (${totalPagado}) no coincide con el total de la venta (${venta.totalVenta}).`
            });
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
                        subTotal: detalle.subTotal || 0, // Asegúrate de usar el campo correcto
                        donacion: detalle.donacion || 0, // Incluye la donación en caso de estar presente
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
            return res.status(201).json({
                message: "Venta creada con éxito.",
                venta: nuevaVenta,
                detalles: detallesVentaIds,
            });            
        } catch (error) {
            await transaction.rollback(); // Revertir cambios en caso de error
            console.error("Error al crear la venta:", error);
            return res.status(500).json({ message: "Error al crear la venta.", error: error.message });
        }
    },

    // * buscar el detalle de ventas de voluntarios
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
                        attributes: ['idDetallePagoVentaVoluntario', 'idTipoPago', 'pago', 'correlativo', 'imagenTransferencia', 'estado', 'idDetalleVentaVoluntario'],
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

    // * Buscar detalles de ventas de stands
    async findByVentaIdStand(req, res) {
        const idVenta = req.params.idVenta;

        try {
            const detalles = await DETALLE_VENTAS_STANDS.findAll({
                where: { idVenta },
                include: [
                    {
                        model: VENTAS,
                        attributes: ['idVenta', 'totalVenta', 'fechaVenta'],
                        include: [
                            {
                                model: TIPO_PUBLICOS,
                                attributes: ['idTipoPublico', 'nombreTipo'], // Tipo de público relacionado
                            },
                        ],
                    },
                    {
                        model: PRODUCTOS,
                        attributes: ['idProducto', 'nombreProducto', 'precio', 'descripcion', 'foto', 'talla'],
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
                        model: STANDS,
                        attributes: ['idStand', 'nombreStand', 'direccion', 'idTipoStands'],
                        include: [
                            {
                                model: db.tipo_stands,
                                attributes: ['idTipoStands', 'tipo'], // Tipo del stand
                            },
                            {
                                model: db.asignacion_stands,
                                as: 'asignaciones',
                                attributes: ['idAsignacionStands', 'idInscripcionEvento', 'idStand', 'idDetalleHorario'],
                                include: [
                                    {
                                        model: db.inscripcion_eventos,
                                        as: 'inscripcionEvento',
                                        attributes: ['idInscripcionEvento', 'idVoluntario', 'idEvento'],
                                        include: [
                                            {
                                                model: db.eventos,
                                                as: 'evento',
                                                attributes: ['idEvento', 'nombreEvento', 'fechaHoraInicio', 'fechaHoraFin', 'descripcion']
                                            },
                                            {
                                                model: db.voluntarios,
                                                as: 'voluntario',
                                                attributes: ['idVoluntario', 'idPersona', 'codigoQR'],
                                                include: [
                                                    {
                                                        model: db.personas,
                                                        as: 'persona',
                                                        attributes: ['idPersona', 'nombre', 'telefono', 'domicilio']
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                    },
                    {
                        model: db.detalle_pago_ventas_stands,
                        as: 'detalle_pago_ventas_stands',
                        attributes: ['idDetallePagoVentaStand', 'idTipoPago', 'pago', 'correlativo', 'imagenTransferencia', 'estado', 'idDetalleVentaStand'],
                        include: [
                            {
                                model: db.tipo_pagos,
                                attributes: ['idTipoPago', 'tipo'], // Tipo de pago relacionado
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
            console.error('Error al recuperar los detalles de la venta de stand:', error);
            return res.status(500).send({
                message: 'Error al recuperar los detalles de la venta de stand.',
                error: error.message,
            });
        }
    },

    // * Crear una venta completa para stands
    async createFullVentaStand(req, res) {
        const { venta, detalles, pagos } = req.body;

        //console.log("Datos recibidos para actualizar:", req.body);

        // Validar datos generales
        if (!venta || !detalles || !pagos) {
            console.error('Datos recibidos son inválidos:', req.body);
            return res.status(400).json({ message: "Faltan datos para crear la venta." });
        }

        // Determinar si todos los pagos son de tipo solicitado (idTipoPago === 5)
        const esPagoSolicitado = pagos.every((pago) => pago.idTipoPago === 5);

        // Validar detalles de venta
        // Validar que los detalles tengan los campos requeridos
        for (const detalle of detalles) {
            if (
                !detalle.idProducto || 
                detalle.cantidad <= 0 || 
                detalle.subTotal === undefined || 
                detalle.subTotal === null
            ) {
                throw new Error(`El detalle de venta es inválido: ${JSON.stringify(detalle)}`);
            }
        }

        // Validar que la suma de pagos y donación coincida con el total de la venta
        const totalPagado = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
        if (totalPagado !== parseFloat(venta.totalVenta)) {
            return res.status(400).json({
                message: `La suma de los montos de los pagos (${totalPagado}) no coincide con el total de la venta (${venta.totalVenta}).`
            });
        }

        const transaction = await db.sequelize.transaction();

        try {

            if (esPagoSolicitado) {
            // Lógica para pagos solicitados directamente aquí
            //console.log('Procesando pagos solicitados');
            
            // Validar que todos los detalles tengan un voluntario
            for (const detalle of detalles) {
                if (!detalle.idVoluntario) {
                    throw new Error(`El detalle de venta requiere un idVoluntario válido: ${JSON.stringify(detalle)}`);
                }
            }

            // Calcular el total de la venta basado en los valores ingresados o forzar a 0
            const totalVenta = detalles.reduce((sum, detalle) => sum + (detalle.subTotal || 0), 0) + (venta.donacion || 0);

            // Crear la venta
            const nuevaVenta = await VENTAS.create(
                {
                    totalVenta,
                    fechaVenta: new Date(),
                    estado: venta.estado || 1,
                    idTipoPublico: venta.idTipoPublico,
                },
                { transaction }
            );

            const idVenta = nuevaVenta.idVenta;

             // Crear detalles de venta y actualizar inventario de productos
            const detallesVentaIds = [];

            // Crear detalles de venta
            for (const detalle of detalles) {

                const producto = await DETALLE_STANDS.findOne({
                    where: { idProducto: detalle.idProducto, idStand: detalle.idStand },
                });
        
                if (!producto || producto.cantidad < detalle.cantidad) {
                    throw new Error(`El producto con ID ${detalle.idProducto} no tiene suficiente inventario en el stand ${detalle.idStand}.`);
                }
        
                // Restar inventario al producto
                await producto.update(
                    { cantidad: producto.cantidad - detalle.cantidad },
                    { transaction }
                );

                // Crear detalle de venta
                const nuevoDetalleVenta = await DETALLE_VENTAS_STANDS.create(
                    {
                        idVenta,
                        idProducto: detalle.idProducto,
                        cantidad: detalle.cantidad,
                        subTotal: detalle.subTotal || 0,
                        donacion: detalle.donacion || 0,
                        idStand: detalle.idStand,
                        idVoluntario: detalle.idVoluntario,
                        estado: detalle.estado || 1,
                    },
                    { transaction }
                );

                detallesVentaIds.push({
                    idProducto: detalle.idProducto,
                    idDetalleVentaStand: nuevoDetalleVenta.idDetalleVentaStand,
                });
            }

            // Crear pagos
            for (const pago of pagos) {
                const detalleVenta = detallesVentaIds.find(
                    (detalle) => detalle.idProducto === pago.idProducto
                );
        
                if (!detalleVenta) {
                    throw new Error(`No se encontró un detalle de venta para el producto con ID ${pago.idProducto}.`);
                }

                await DETALLE_PAGO_VENTAS_STANDS.create(
                    {
                       idDetalleVentaStand: detalleVenta.idDetalleVentaStand, // Asociar correctamente
                        idTipoPago: pago.idTipoPago,
                        pago: pago.monto || 0, // Si no se especifica, forzar a 0
                        correlativo: pago.correlativo || "NA", // Si no se especifica, forzar a "NA"
                        imagenTransferencia: pago.imagenTransferencia || "solicitado", // Si no se especifica, forzar a "solicitado"
                        estado: pago.estado || 1,
                    },
                    { transaction }
                );
            }

            await transaction.commit();
            return res.status(201).json({
                message: "Venta creada con éxito.",
                venta: nuevaVenta,
                detalles: detallesVentaIds,
            });

            } else {
                //console.log('Procesando lógica para otros pagos');
                // Crear la venta principal
                const nuevaVenta = await VENTAS.create(
                    {
                        totalVenta: venta.totalVenta,
                        fechaVenta: new Date(),
                        estado: venta.estado || 1,
                        idTipoPublico: venta.idTipoPublico,
                    },
                    { transaction }
                );

                const idVenta = nuevaVenta.idVenta;

                // Crear detalles de venta y actualizar inventario de productos
                const detallesVentaIds = [];

                for (const detalle of detalles) {
                    const producto = await DETALLE_STANDS.findOne({
                        where: { idProducto: detalle.idProducto, idStand: detalle.idStand },
                    });

                    if (!producto || producto.cantidad < detalle.cantidad) {
                        throw new Error(`El producto con ID ${detalle.idProducto} no tiene suficiente inventario en el stand ${detalle.idStand}.`);
                    }

                    // Restar inventario al producto
                    await producto.update(
                        { cantidad: producto.cantidad - detalle.cantidad },
                        { transaction }
                    );

                    // Crear detalle de venta
                    const nuevoDetalleVenta = await DETALLE_VENTAS_STANDS.create(
                        {
                            idVenta,
                            idProducto: detalle.idProducto,
                            cantidad: detalle.cantidad,
                            subTotal: detalle.subTotal || 0,
                            donacion: detalle.donacion || 0,
                            idStand: detalle.idStand,
                            idVoluntario: detalle.idVoluntario || null, // Puede ser nulo si no hay voluntario
                        },
                        { transaction }
                    );

                    detallesVentaIds.push({
                        idProducto: detalle.idProducto,
                        idDetalleVentaStand: nuevoDetalleVenta.idDetalleVentaStand,
                    });
                }

                // Crear detalles de pagos
                for (const pago of pagos) {
                    const detalleVenta = detallesVentaIds.find(
                        (detalle) => detalle.idProducto === pago.idProducto
                    );

                    if (!detalleVenta) {
                        throw new Error(`No se encontró un detalle de venta para el producto con ID ${pago.idProducto}.`);
                    }

                    let correlativo = pago.correlativo || "NA";
                    let imagenTransferencia = pago.imagenTransferencia || "efectivo";

                    if ([1, 2, 4].includes(pago.idTipoPago)) {
                        if (!pago.correlativo || !pago.imagenTransferencia) {
                            throw new Error(`El tipo de pago ${pago.idTipoPago} requiere correlativo e imagen.`);
                        }
                        correlativo = pago.correlativo;
                        imagenTransferencia = pago.imagenTransferencia;
                    } else if (pago.idTipoPago === 3) { // Efectivo
                        correlativo = "NA";
                        imagenTransferencia = "efectivo";
                    }

                    await DETALLE_PAGO_VENTAS_STANDS.create(
                        {
                            idDetalleVentaStand: detalleVenta.idDetalleVentaStand,
                            idTipoPago: pago.idTipoPago,
                            pago: pago.monto,
                            correlativo: correlativo,
                            imagenTransferencia: imagenTransferencia,
                            estado: pago.estado || 1,
                        },
                        { transaction }
                    );
                }

                await transaction.commit();
                return res.status(201).json({
                    message: "Venta creada con éxito.",
                    venta: nuevaVenta,
                    detalles: detallesVentaIds,
                });
            }
        } catch (error) {
            await transaction.rollback();
            console.error("Error al crear la venta:", error);
            return res.status(500).json({ message: "Error al crear la venta.", error: error.message });
        }
    },

    // Método auxiliar para manejar pagos solicitados
    async handlePagoSolicitado(venta, detalles, pagos, transaction) {
        // Validar que todos los detalles tengan un voluntario
        for (const detalle of detalles) {
            if (!detalle.idVoluntario) {
                throw new Error(`El detalle de venta requiere un idVoluntario válido: ${JSON.stringify(detalle)}`);
            }
        }

        // Calcular el total de la venta basado en los valores ingresados o forzarlos a 0
        const totalVenta = detalles.reduce((sum, detalle) => sum + (detalle.subTotal || 0), 0) + (venta.donacion || 0);

        // Crear la venta
        const nuevaVenta = await VENTAS.create(
            {
                totalVenta, // Puede ser calculado o 0
                fechaVenta: new Date(),
                estado: venta.estado || 1,
                idTipoPublico: venta.idTipoPublico,
            },
            { transaction }
        );

        const idVenta = nuevaVenta.idVenta;

        // Crear detalles
        const detallesVentaIds = [];
        for (const detalle of detalles) {
            const nuevoDetalleVenta = await DETALLE_VENTAS_STANDS.create(
                {
                    idVenta,
                    idProducto: detalle.idProducto,
                    cantidad: detalle.cantidad,
                    subTotal: detalle.subTotal || 0, // Si no se especifica, forzar a 0
                    donacion: detalle.donacion || 0, // Si no se especifica, forzar a 0
                    idStand: detalle.idStand,
                    idVoluntario: detalle.idVoluntario,
                    estado: detalle.estado || 1,
                },
                { transaction }
            );

            detallesVentaIds.push({
                idProducto: detalle.idProducto,
                idDetalleVentaStand: nuevoDetalleVenta.idDetalleVentaStand,
            });
        }

        // Crear pagos
        for (const pago of pagos) {
            const detalleVenta = detallesVentaIds.find(
                (detalle) => detalle.idProducto === pago.idProducto
            );

            if (!detalleVenta) {
                throw new Error(`No se encontró un detalle de venta para el producto con ID ${pago.idProducto}.`);
            }

            await DETALLE_PAGO_VENTAS_STANDS.create(
                {
                    idDetalleVentaStand: detalleVenta.idDetalleVentaStand,
                    idTipoPago: 5, // Tipo solicitado
                    pago: pago.monto || 0, // Si no se especifica, forzar a 0
                    correlativo: pago.correlativo || "NA", // Si no se especifica, forzar a "NA"
                    imagenTransferencia: pago.imagenTransferencia || "solicitado", // Si no se especifica, forzar a "solicitado"
                    estado: pago.estado || 1,
                },
                { transaction }
            );
        }
    }, 
    
    // * actualizar las ventas de voluntarios 
    async updateFullVenta(req, res) {
        const { idVenta } = req.params;
        const { venta, detalles, pagos } = req.body;
    
        //console.log("Datos recibidos para actualizar:", req.body);
    
        if (!idVenta || !venta || !detalles || !pagos) {
            return res.status(400).json({ message: "Faltan datos para actualizar la venta." });
        }
    
        const transaction = await db.sequelize.transaction();
    
        try {
            // Validar que el totalVenta coincida con los detalles
            const totalCalculado = detalles.reduce((sum, detalle) => {
                return sum + parseFloat(detalle.subTotal || 0) + parseFloat(detalle.donacion || 0);
            }, 0);
    
            if (parseFloat(venta.totalVenta) !== totalCalculado) {
                throw new Error(
                    `El total de la venta (${venta.totalVenta}) no coincide con el total calculado (${totalCalculado}).`
                );
            }
    
            // Validar que los pagos coincidan con el totalVenta
            const totalPagos = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
            if (totalPagos !== parseFloat(venta.totalVenta)) {
                throw new Error(
                    `La suma de los pagos (${totalPagos}) no coincide con el total de la venta (${venta.totalVenta}).`
                );
            }
    
            // Actualizar la venta principal
            const ventaExistente = await VENTAS.findByPk(idVenta);
            if (!ventaExistente) {
                throw new Error(`No se encontró la venta con ID ${idVenta}.`);
            }
    
            await ventaExistente.update(
                {
                    totalVenta: venta.totalVenta,
                    estado: venta.estado,
                    idTipoPublico: venta.idTipoPublico || 2,
                    updatedAt: new Date(),
                },
                { transaction }
            );
    
            // Manejar los detalles y pagos de la venta
            const detallesExistentes = await DETALLE_VENTAS_VOLUNTARIOS.findAll({ where: { idVenta }, transaction });
    
            // Eliminar todos los pagos asociados a los detalles de la venta
            await DETALLE_PAGO_VENTAS_VOLUNTARIOS.destroy({
                where: { idDetalleVentaVoluntario: detallesExistentes.map((d) => d.idDetalleVentaVoluntario) },
                transaction,
            });
    
            // Eliminar todos los detalles existentes
            for (const detalle of detallesExistentes) {
                const producto = await DETALLE_PRODUCTOS_VOLUNTARIOS.findOne({ where: { idProducto: detalle.idProducto }, transaction });
                if (producto) {
                    await producto.update(
                        { cantidad: producto.cantidad + detalle.cantidad },
                        { transaction }
                    );
                }
                await detalle.destroy({ transaction });
            }
    
            // Crear nuevos detalles de venta y actualizar inventario de productos
            const detallesVentaIds = [];
            for (const detalle of detalles) {
                const productoNuevo = await DETALLE_PRODUCTOS_VOLUNTARIOS.findOne({
                    where: { idProducto: detalle.idProducto },
                    transaction,
                });
    
                if (!productoNuevo || productoNuevo.cantidad < detalle.cantidad) {
                    throw new Error(
                        `El producto con ID ${detalle.idProducto} no tiene suficiente inventario.`
                    );
                }
    
                const nuevoDetalle = await DETALLE_VENTAS_VOLUNTARIOS.create(
                    {
                        idVenta,
                        idProducto: detalle.idProducto,
                        cantidad: detalle.cantidad,
                        subTotal: detalle.subTotal,
                        donacion: detalle.donacion || 0,
                        idVoluntario: detalle.idVoluntario,
                        estado: detalle.estado || 1,
                    },
                    { transaction }
                );
    
                detallesVentaIds.push({
                    idProducto: detalle.idProducto,
                    idDetalleVentaVoluntario: nuevoDetalle.idDetalleVentaVoluntario,
                });
    
                await productoNuevo.update(
                    { cantidad: productoNuevo.cantidad - detalle.cantidad },
                    { transaction }
                );
            }
    
            // Crear nuevos pagos asociados a los productos
            for (const pago of pagos) {
                const detalleVenta = detallesVentaIds.find(
                    (detalle) => detalle.idProducto === pago.idProducto
                );
    
                if (!detalleVenta) {
                    throw new Error(`No se encontró un detalle de venta para el producto con ID ${pago.idProducto}.`);
                }
    
                let correlativo = pago.correlativo || "NA";
                let imagenTransferencia = pago.imagenTransferencia || "efectivo";
    
                if ([1, 2, 4].includes(pago.idTipoPago)) {
                    if (!pago.correlativo || !pago.imagenTransferencia) {
                        throw new Error(`El tipo de pago ${pago.idTipoPago} requiere correlativo e imagen.`);
                    }
                    correlativo = pago.correlativo;
                    imagenTransferencia = pago.imagenTransferencia;
                } else if (pago.idTipoPago === 3) { // Efectivo
                    correlativo = "NA";
                    imagenTransferencia = "efectivo";
                }
    
                await DETALLE_PAGO_VENTAS_VOLUNTARIOS.create(
                    {
                        idDetalleVentaVoluntario: detalleVenta.idDetalleVentaVoluntario,
                        idTipoPago: pago.idTipoPago,
                        pago: pago.monto,
                        correlativo: correlativo,
                        imagenTransferencia: imagenTransferencia,
                        estado: pago.estado || 1,
                    },
                    { transaction }
                );
            }
    
            await transaction.commit();
            return res.status(200).json({ message: "Venta actualizada con éxito." });
    
        } catch (error) {
            await transaction.rollback();
            console.error("Error al actualizar la venta:", error);
            return res.status(500).json({ message: "Error al actualizar la venta.", error: error.message });
        }
    },

    // * update de ventas de stands
    async updateFullVentaStand(req, res) {
        const { idVenta } = req.params;
        const { venta, detalles, pagos } = req.body;
    
        //console.log("datos recibidos:", req.body);
    
        if (!venta || !detalles || !pagos || !idVenta) {
            console.error('Datos recibidos son inválidos:', req.body);
            return res.status(400).json({ message: "Faltan datos para actualizar la venta." });
        }
    
        const transaction = await db.sequelize.transaction();
    
        try {
            // Validar datos básicos
            const totalPagado = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
            if (totalPagado !== parseFloat(venta.totalVenta)) {
                throw new Error(`La suma de los pagos (${totalPagado}) no coincide con el total de la venta (${venta.totalVenta}).`);
            }
    
            // Actualizar la venta principal
            const ventaOriginal = await VENTAS.findByPk(idVenta, { transaction });
            if (!ventaOriginal) {
                throw new Error(`La venta con ID ${idVenta} no existe.`);
            }
    
            await ventaOriginal.update(
                {
                    totalVenta: venta.totalVenta,
                    estado: venta.estado || 1,
                    idTipoPublico: venta.idTipoPublico,
                },
                { transaction }
            );
    
            // Eliminar pagos existentes
            await DETALLE_PAGO_VENTAS_STANDS.destroy({
                where: { idDetalleVentaStand: detalles.map((d) => d.idDetalleVentaStand) },
                transaction,
            });
    
            // Eliminar detalles existentes
            const detallesActuales = await DETALLE_VENTAS_STANDS.findAll({
                where: { idVenta },
                transaction,
            });
    
            for (const detalle of detallesActuales) {
                const producto = await DETALLE_STANDS.findOne({
                    where: { idProducto: detalle.idProducto, idStand: detalle.idStand },
                    transaction,
                });
    
                if (producto) {
                    await producto.update(
                        { cantidad: producto.cantidad + detalle.cantidad },
                        { transaction }
                    );
                }
    
                // Elimina pagos relacionados con este detalle
                await DETALLE_PAGO_VENTAS_STANDS.destroy({
                    where: { idDetalleVentaStand: detalle.idDetalleVentaStand },
                    transaction,
                });
    
                await detalle.destroy({ transaction });
            }
    
            // Crear nuevos detalles de venta y actualizar inventario de productos
            const detallesVentaIds = [];
    
            for (const detalle of detalles) {
                const productoNuevo = await DETALLE_STANDS.findOne({
                    where: { idProducto: detalle.idProducto, idStand: detalle.idStand },
                    transaction,
                });
    
                if (!productoNuevo || productoNuevo.cantidad < detalle.cantidad) {
                    throw new Error(
                        `El producto con ID ${detalle.idProducto} no tiene suficiente inventario en el stand ${detalle.idStand}.`
                    );
                }
    
                const nuevoDetalle = await DETALLE_VENTAS_STANDS.create(
                    {
                        idVenta,
                        idProducto: detalle.idProducto,
                        cantidad: detalle.cantidad,
                        subTotal: detalle.subTotal,
                        donacion: detalle.donacion || 0,
                        idStand: detalle.idStand,
                        idVoluntario: detalle.idVoluntario,
                        estado: detalle.estado || 1,
                    },
                    { transaction }
                );
    
                detallesVentaIds.push({
                    idProducto: detalle.idProducto,
                    idDetalleVentaStand: nuevoDetalle.idDetalleVentaStand,
                });
    
                await productoNuevo.update(
                    { cantidad: productoNuevo.cantidad - detalle.cantidad },
                    { transaction }
                );
            }
    
            // Crear detalles de pagos
            for (const pago of pagos) {
                const detalleVenta = detallesVentaIds.find(
                    (detalle) => detalle.idProducto === pago.idProducto
                );
    
                if (!detalleVenta) {
                    throw new Error(`No se encontró un detalle de venta para el producto con ID ${pago.idProducto}.`);
                }
    
                let correlativo = pago.correlativo || "NA";
                let imagenTransferencia = pago.imagenTransferencia || "efectivo";
    
                if ([1, 2, 4].includes(pago.idTipoPago)) {
                    if (!pago.correlativo || !pago.imagenTransferencia) {
                        throw new Error(`El tipo de pago ${pago.idTipoPago} requiere correlativo e imagen.`);
                    }
                    correlativo = pago.correlativo;
                    imagenTransferencia = pago.imagenTransferencia;
                } else if (pago.idTipoPago === 3) { // Efectivo
                    correlativo = "NA";
                    imagenTransferencia = "efectivo";
                }
    
                await DETALLE_PAGO_VENTAS_STANDS.create(
                    {
                        idDetalleVentaStand: detalleVenta.idDetalleVentaStand,
                        idTipoPago: pago.idTipoPago,
                        pago: pago.monto,
                        correlativo: correlativo,
                        imagenTransferencia: imagenTransferencia,
                        estado: pago.estado || 1,
                    },
                    { transaction }
                );
            }
    
            await transaction.commit();
            return res.status(200).json({ message: "Venta actualizada con éxito." });
        } catch (error) {
            await transaction.rollback();
            console.error("Error al actualizar la venta:", error);
            return res.status(500).json({ message: "Error al actualizar la venta.", error: error.message });
        }
    }
};
