'use strict';
const db = require("../models");
const { Op, where } = require('sequelize');
const moment = require('moment-timezone');
const RIFAS = db.rifas;
const TALONARIOS = db.talonarios;
const SOLICITUD_TALONARIOS = db.solicitudTalonarios;
const VOLUNTARIOS = db.voluntarios;
const PERSONAS = db.personas;
const RECAUDACION_RIFAS = db.recaudacion_rifas;
const DETALLE_PAGO_RECAUDACION_RIFAS = db.detalle_pago_recaudacion_rifas;

// reporte de contabilidad
const PRODUCTOS = db.productos;
const CATEGORIAS = db.categorias;
const DETALLE_PRODUCTOS = db.detalle_productos;
const SEDES = db.sedes;
const BITACORAS = db.bitacoras;
const CATEGORIA_BITACORAS = db.categoria_bitacoras;
const TRASLADOS = db.traslados;
const TIPO_TRASLADOS = db.TipoTraslado;
const DETALLE_TRASLADOS = db.detalle_traslados;
const PEDIDOS = db.pedidos;
const DETALLE_PEDIDOS = db.detalle_pedidos;
const VENTAS = db.ventas;
const DETALLE_VENTAS_VOLUNTARIOS = db.detalle_ventas_voluntarios;
const DETALLE_PAGO_VENTAS_VOLUNTARIOS = db.detalle_pago_ventas_voluntarios;
const DETALLE_VENTAS_STANDS = db.detalle_ventas_stands;
const DETALLE_PAGO_VENTAS_STANDS = db.detalle_pago_ventas_stands;
const STANDS = db.stands;
const TIPO_PUBLICOS = db.tipo_publicos;
const TIPO_PAGOS = db.tipo_pagos;
const RECAUDACION_EVENTOS = db.recaudacion_eventos;
const EVENTOS = db.eventos;
const EMPLEADOS = db.empleados;

module.exports = {
    async reporteRifas(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.body;

            // Validar las fechas
            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({ message: "Se requieren las fechas de inicio y fin." });
            }

            const fechaInicioFormato = fechaInicio.split("-").reverse().join("-");
            const fechaFinFormato = fechaFin.split("-").reverse().join("-");

            if (isNaN(Date.parse(fechaInicioFormato)) || isNaN(Date.parse(fechaFinFormato))) {
                return res.status(400).json({ message: "Las fechas no son válidas." });
            }

            // Obtener rifas activas en el rango de fechas
            const rifas = await RIFAS.findAll({
                where: {
                    fechaInicio: {
                        [Op.gte]: fechaInicioFormato,
                    },
                    fechaFin: {
                        [Op.lte]: fechaFinFormato,
                    },
                    estado: 1,
                    idSede: 1,
                },
            });

            if (!rifas || rifas.length === 0) {
                return res.status(404).json({ message: "No se encontraron rifas en el rango de fechas especificado." });
            }

            const reporte = [];

            for (const rifa of rifas) {
                // Obtener talonarios asociados a la rifa
                const talonarios = await TALONARIOS.findAll({
                    where: { idRifa: rifa.idRifa, estado: 1 },
                });

                if (!talonarios || talonarios.length === 0) continue;

                // Obtener solicitudes de talonarios y los voluntaJrios asociados
                const solicitudes = await SOLICITUD_TALONARIOS.findAll({
                    where: { idTalonario: { [Op.in]: talonarios.map((t) => t.idTalonario) }, estado: 1 },
                    include: [
                        {
                            model: VOLUNTARIOS,
                            include: [{ model: PERSONAS, attributes: ["nombre", "correo"] }],
                        },
                    ],
                });

                if (!solicitudes || solicitudes.length === 0) continue;

                // Obtener la recaudación de rifas asociada a estas solicitudes
                const recaudaciones = await RECAUDACION_RIFAS.findAll({
                    where: { idSolicitudTalonario: { [Op.in]: solicitudes.map((s) => s.idSolicitudTalonario) }, estado: 1 },
                    include: [{ model: DETALLE_PAGO_RECAUDACION_RIFAS }],
                });

                let totalRecaudacion = 0;
                let boletosVendidos = 0;
                let detallePagos = [];
                let voluntarioMasVentas = { nombre: "", boletosVendidos: 0 };

                for (const recaudacion of recaudaciones) {
                    totalRecaudacion += parseFloat(recaudacion.subTotal || 0);
                    boletosVendidos += recaudacion.boletosVendidos || 0;

                    const voluntario = solicitudes.find(
                        (s) => s.idSolicitudTalonario === recaudacion.idSolicitudTalonario
                    )?.voluntario;

                    if (voluntario) {
                        const nombreVoluntario = voluntario.persona?.nombre || "Voluntario desconocido";
                        const boletosDelVoluntario = recaudacion.boletosVendidos || 0;

                        if (boletosDelVoluntario > voluntarioMasVentas.boletosVendidos) {
                            voluntarioMasVentas = { nombre: nombreVoluntario, boletosVendidos: boletosDelVoluntario };
                        }
                    }

                    // Procesar detalle de pagos
                    detallePagos = [
                        ...detallePagos,
                        ...recaudacion.detalle_pago_recaudacion_rifas.map((detalle) => ({
                            correlativo: detalle.correlativo,
                            pago: detalle.pago,
                            tipoPago: detalle.idTipoPago,
                        })),
                    ];
                }

                reporte.push({
                    idRifa: rifa.idRifa,
                    nombreRifa: rifa.nombreRifa,
                    descripcion: rifa.descripcion,
                    precioBoleto: rifa.precioBoleto,
                    totalRecaudacion,
                    boletosVendidos,
                    voluntarioMasVentas,
                });
            }

            return res.status(200).json({ reporte });
        } catch (error) {
            console.error("Error al generar el reporte de rifas:", error);
            return res.status(500).json({ message: "Error al generar el reporte de rifas." });
        }
    },

    // reporte de contabilidad
    async reporteContabilidad(req, res) {

        try {
            let { fechaInicio, fechaFin } = req.query;

            // Validar que las fechas no sean nulas o vacías
            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({ message: 'Las fechas de inicio y fin son requeridas.' });
            }

            // Convertir fechas a rangos completos de 24 horas usando moment
            fechaInicio = moment(fechaInicio, 'YYYY-MM-DD HH:mm:ss').startOf('day').toDate();
            fechaFin = moment(fechaFin, 'YYYY-MM-DD HH:mm:ss').endOf('day').toDate();
    
            console.log('Fecha inicio:', moment(fechaInicio).format('YYYY-MM-DD HH:mm:ss'));
            console.log('Fecha fin:', moment(fechaFin).format('YYYY-MM-DD HH:mm:ss'));

            // Obtener las rifas que caen dentro del rango de fechas especificado
            const rifas = await RIFAS.findAll({
                where: {
                    [Op.or]: [
                        {
                            fechaInicio: {
                                [Op.between]: [fechaInicio, fechaFin]
                            }
                        },
                        {
                            fechaFin: {
                                [Op.between]: [fechaInicio, fechaFin]
                            }
                        },
                        {
                            fechaInicio: {
                                [Op.lte]: fechaInicio
                            },
                            fechaFin: {
                                [Op.gte]: fechaFin
                            }
                        }
                    ]
                },
                attributes: ['idRifa', 'nombreRifa', 'precioBoleto', 'descripcion', 'fechaInicio', 'fechaFin']
            });

            // Obtener los IDs de las rifas
            const rifaIds = rifas.map(rifa => rifa.idRifa);
            //console.log('IDs de rifas:', rifaIds);
            // productos con detalles, movimientos (excesos, ajustes y faltas), traslados y pedidos con detalles (INVENTARIO)
            const productos = await PRODUCTOS.findAll({
                where: { estado: 1 },
                attributes: ['idProducto', 'nombreProducto', 'talla', 'precio', 'descripcion', 'foto', 'cantidadMinima', 'cantidadMaxima', 'idCategoria'],
                include: [
                    {
                        model: CATEGORIAS,
                        attributes: ['idCategoria', 'nombreCategoria']
                    },    
                    {
                        model: DETALLE_PRODUCTOS,
                        attributes: ['idDetalleProductos', 'idProducto', 'cantidad', 'idSede'],
                        include: [
                            {
                                model: SEDES,
                                attributes: ['idSede', 'nombreSede']
                            }
                        ]
                    }
                ]
            });
            // movimientos de productos (excesos, ajustes y faltas)
            const movimientosProductos = await BITACORAS.findAll({
                where: {
                    fechaHora: {
                        [Op.between]: [fechaInicio, fechaFin]
                    },
                    idCategoriaBitacora: {
                        [Op.in]: [3, 8, 9]
                    },
                    estado: 1
                },
                attributes: ['idBitacora', 'fechaHora', 'descripcion', 'idCategoriaBitacora'],
                include: [{
                    model: CATEGORIA_BITACORAS,
                    attributes: ['idCategoriaBitacora', 'categoria']
                }]
            });

            // Formatear las fechas en los resultados antes de enviarlos
            const formattedMovimientosProductos = movimientosProductos.map(mov => ({
                ...mov.toJSON(),
                fechaHora: moment(mov.fechaHora).format('YYYY-MM-DD HH:mm:ss')
            }));

            // traslados de productos
            const traslados = await TRASLADOS.findAll({
                where: {
                    fecha: {
                        [Op.between]: [fechaInicio, fechaFin]
                    },
                    estado: 1
                },
                attributes: ['idTraslado', 'fecha', 'descripcion', 'idTipoTraslado'],
                include: [
                    {
                        model: TIPO_TRASLADOS,
                        attributes: ['idTipoTraslado', 'tipo'],
                        as: 'tipoTraslado'
                    },
                    {
                        model: DETALLE_TRASLADOS,
                        attributes: ['idDetalleTraslado', 'idProducto', 'cantidad', 'idTraslado'],
                    }
                ]
            });
            // pedidos con detalles
            const pedidos = await PEDIDOS.findAll({
                where: {
                    fecha: {
                        [Op.between]: [fechaInicio, fechaFin]
                    },
                    estado: 1
                },
                attributes: ['idPedido', 'fecha', 'descripcion', 'idSede'],
                include: [
                    {
                        model: SEDES,
                        attributes: ['idSede', 'nombreSede'],
                        as: 'sede'
                    },
                    {
                        model: DETALLE_PEDIDOS,
                        attributes: ['idDetallePedido', 'idProducto', 'cantidad', 'idPedido']
                    }
                ]
            });
            // ventas con detalles de stands y voluntarios, pagos de ambos
            // ventas de voluntarios
            const ventasVoluntarios = await VENTAS.findAll({
                where: {
                    fechaVenta: {
                        [Op.between]: [fechaInicio, fechaFin]
                    },
                    estado: 1
                },
                include: [
                    {
                        model: DETALLE_VENTAS_VOLUNTARIOS, // Relación con detalles de ventas de voluntarios
                        as: 'detalle_ventas_voluntarios',
                        include: [
                            {
                                model: VOLUNTARIOS, // Información del voluntario
                                as: 'voluntario',
                                attributes: ['idVoluntario', 'idPersona'],
                                include: [
                                    {
                                        model: PERSONAS,
                                        as: 'persona',
                                        attributes: ['idPersona', 'nombre', 'telefono', 'domicilio']
                                    }
                                ]
                            },
                            {
                                model: PRODUCTOS, // Productos vendidos
                                attributes: ['idProducto', 'nombreProducto', 'precio', 'descripcion', 'foto', 'talla']
                            },
                            {
                                model: DETALLE_PAGO_VENTAS_VOLUNTARIOS, // Relación con pagos
                                as: 'detalle_pago_ventas_voluntarios',
                                attributes: ['idDetallePagoVentaVoluntario', 'idTipoPago', 'pago', 'correlativo', 'imagenTransferencia', 'estado', 'idDetalleVentaVoluntario'],
                                include: [
                                    {
                                        model: TIPO_PAGOS,
                                        attributes: ['idTipoPago', 'tipo'] // Incluye el tipo de pago
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: TIPO_PUBLICOS, // Tipo de público
                        attributes: ['idTipoPublico', 'nombreTipo']
                    }
                ]
            });
            // ventas de voluntarios en específico
            const ventasConDetallesVoluntarios = ventasVoluntarios.filter(
                venta => venta.detalle_ventas_voluntarios && venta.detalle_ventas_voluntarios.length > 0
            );
            // ventas de stands
            const ventasStands = await VENTAS.findAll({
                where: {
                    fechaVenta: {
                        [Op.between]: [fechaInicio, fechaFin]
                    },
                    estado: 1
                },
                include: [
                    {
                        model: DETALLE_VENTAS_STANDS, // Relación con detalles de ventas de stands
                        as: 'detalle_ventas_stands',
                        include: [
                            {
                                model: STANDS, // Información del stand
                                attributes: ['idStand', 'nombreStand', 'direccion'],
                                include: [
                                    {
                                        model: db.tipo_stands, // Tipo de stand
                                        attributes: ['idTipoStands', 'tipo']
                                    }
                                ]
                            },
                            {
                                model: PRODUCTOS, // Productos vendidos
                                attributes: ['idProducto', 'nombreProducto', 'precio', 'descripcion', 'foto', 'talla']
                            },
                            {
                                model: DETALLE_PAGO_VENTAS_STANDS, // Relación con pagos
                                as: 'detalle_pago_ventas_stands',
                                attributes: ['idDetallePagoVentaStand', 'idTipoPago', 'pago', 'correlativo', 'imagenTransferencia', 'estado', 'idDetalleVentaStand'],
                                include: [
                                    {
                                        model: TIPO_PAGOS,
                                        attributes: ['idTipoPago', 'tipo'] // Incluye el tipo de pago
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: TIPO_PUBLICOS, // Tipo de público
                        attributes: ['idTipoPublico', 'nombreTipo']
                    }
                ]
            });

            // Filtrar ventas de stands que tienen detalles en detalle_ventas_stands
            const ventasConDetallesStands = ventasStands.filter(
                venta => venta.detalle_ventas_stands && venta.detalle_ventas_stands.length > 0
            );
            // recaudaciones de rifas con detalles de pagos y recaudaciones de eventos
            // recaudaciones de eventos
            const recaudacionesEventos = await RECAUDACION_EVENTOS.findAll({
                where: {
                    fechaRegistro: {
                        [Op.between]: [fechaInicio, fechaFin]
                    },
                    estado: 1
                },
                include: [
                    {
                        model: EVENTOS,
                        as: 'evento',
                        include: [
                            {
                                model: SEDES,
                                as: 'sede'
                            }
                        ]
                    },
                    {
                        model: EMPLEADOS,
                        as: 'empleado',
                        include: [
                            {
                                model: PERSONAS,
                                as: 'persona'
                            }
                        ]
                    }
                ]
            });

            // Recaudaciones de rifas
            const recaudacionesRifas = await RECAUDACION_RIFAS.findAll({
                where: { estado: 1 },
                include: [
                    {
                        model: DETALLE_PAGO_RECAUDACION_RIFAS, // Detalles de los pagos
                        attributes: ['idTipoPago', 'pago', 'correlativo', 'imagenTransferencia', 'estado'],
                        include: [
                            {
                                model: TIPO_PAGOS, // Tipo de pago
                                attributes: ['tipo']
                            }
                        ]
                    },
                    {
                        model: SOLICITUD_TALONARIOS, // Solicitud del talonario
                        include: [
                            {
                                model: TALONARIOS, // Talonario asociado
                                attributes: ['codigoTalonario', 'cantidadBoletos', 'correlativoInicio', 'correlativoFinal'],
                                include: [
                                    {
                                        model: RIFAS, // Información de la rifa
                                        attributes: ['nombreRifa', 'precioBoleto', 'descripcion', 'fechaInicio', 'fechaFin'],
                                        where: {
                                            idRifa: {
                                                [Op.in]: rifaIds
                                            }
                                        },
                                    }
                                ]
                            },
                            {
                                model: VOLUNTARIOS, // Información del voluntario
                                include: [
                                    {
                                        model: PERSONAS, // Información personal del voluntario
                                        attributes: ['idPersona', 'nombre', 'telefono', 'correo']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            // Filtrar recaudaciones de rifas sin talonarios nulos
            const recaudacionesConTalonarios = recaudacionesRifas.filter(
                recaudacion => recaudacion.solicitudTalonario.talonario !== null
            );

            // Combinar todos los datos en un solo objeto
            const reporte = {
                productos,
                movimientosProductos: formattedMovimientosProductos,
                traslados,
                pedidos,
                ventasVoluntarios: ventasConDetallesVoluntarios,
                ventasStands: ventasConDetallesStands,
                recaudacionesEventos,
                recaudacionesRifas: recaudacionesConTalonarios,
            };

            return res.status(200).json(reporte);
        } catch (error) {
            console.error('Error al generar el reporte de contabilidad:', error);
            return res.status(500).json({ message: 'Error al recuperar los datos.' });
        }
    }
};