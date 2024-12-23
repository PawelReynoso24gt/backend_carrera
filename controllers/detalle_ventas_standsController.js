'use strict';

const db = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

const detalle_ventas_stands = require('../models/detalle_ventas_stands');
const DETALLE_VENTAS_STANDS = db.detalle_ventas_stands;
const VENTAS = db.ventas;
const PRODUCTOS = db.productos;
const STANDS =db.stands;
const DETALLE_STANDS = db.detalle_stands;


// Función para validar los datos del detalle de venta
function validateDetalleVentaData(datos) {
    if (datos.cantidad !== undefined) {
        if (isNaN(datos.cantidad) || datos.cantidad <= 0) {
            return { error: 'La cantidad debe ser un número mayor a 0.' };
        }
    }

    if (datos.idVenta !== undefined) {
        if (isNaN(datos.idVenta) || datos.idVenta < 1) {
            return { error: 'El ID de la venta debe ser un número válido mayor a 0.' };
        }
    }

    if (datos.idProducto !== undefined) {
        if (isNaN(datos.idProducto) || datos.idProducto < 1) {
            return { error: 'El ID del producto debe ser un número válido mayor a 0.' };
        }
    }

    if (datos.idStand !== undefined) {
        if (isNaN(datos.idStand) || datos.idStand < 1) {
            return { error: 'El ID del stand debe ser un número válido mayor a 0.' };
        }
    }

    if (datos.estado !== undefined) {
        if (datos.estado !== 0 && datos.estado !== 1) {
            return { error: 'El estado debe ser 0 o 1.' };
        }
    }

    // Verificar que al menos un campo esté presente para actualizaciones
    if (
        datos.cantidad === undefined &&
        datos.idVenta === undefined &&
        datos.idProducto === undefined &&
        datos.idStand === undefined &&
        datos.estado === undefined
    ) {
        return { error: 'Debe proporcionar al menos un campo para actualizar.' };
    }

    return null;
}

module.exports = {
    // * Obtener todos los detalles de venta
    async findAll(req, res) {
        try {
            const detalles = await DETALLE_VENTAS_STANDS.findAll({
                where: { estado: 1 },
                include: [
                    {
                        model: VENTAS,
                        attributes: ['idVenta', 'totalVenta', 'fechaVenta']
                    },
                    {
                        model: PRODUCTOS,
                        attributes: ['idProducto', 'nombreProducto', 'precio']
                    },
                    {
                        model: STANDS,
                        attributes: ['idStand', 'nombreStand', 'direccion', 'idTipoStands'],
                        include: [
                            {
                                model: db.asignacion_stands,
                                as: 'asignaciones',
                                attributes: ['idAsignacionStands', 'idStand', 'idInscripcionEvento', 'idDetalleHorario'],
                                include: [
                                    {
                                        model: db.inscripcion_eventos,
                                        as: 'inscripcionEvento',
                                        attributes: ['idInscripcionEvento', 'idEvento', 'idVoluntario']
                                    }
                                ]
                            },

                            {
                                model: db.detalle_stands,
                                as: 'detallesStands', 
                                attributes: ['idDetalleStands', 'cantidad', 'estado', 'idProducto'],
                                include: [
                                    {
                                        model: db.productos,
                                        as: 'producto',
                                        attributes: ['idProducto', 'nombreProducto', 'precio']
                                    }
                                ],
                            }
                        ],
                    }
                ]
            });

            return res.status(200).send(detalles);
        } catch (error) {
            console.error('Error al recuperar los detalles de venta:', error);
            return res.status(500).send({ message: 'Ocurrió un error al recuperar los detalles de venta.' });
        }
    },

    // * detalles con estado 1
    async findActive(req, res) {
        try {
            const detalles = await DETALLE_VENTAS_STANDS.findAll({
                where: { estado: 1 },
                include: [
                    {
                        model: VENTAS,
                        attributes: ['idVenta', 'totalVenta', 'fechaVenta']
                    },
                    {
                        model: PRODUCTOS,
                        attributes: ['idProducto', 'nombreProducto', 'precio']
                    },
                    {
                        model: STANDS,
                        attributes: ['idStand', 'nombreStand', 'direccion', 'idTipoStands'],
                        include: [
                            {
                                model: db.asignacion_stands,
                                as: 'asignaciones',
                                attributes: ['idAsignacionStands', 'idStand', 'idInscripcionEvento', 'idDetalleHorario'],
                                include: [
                                    {
                                        model: db.inscripcion_eventos,
                                        as: 'inscripcionEvento',
                                        attributes: ['idInscripcionEvento', 'idEvento', 'idVoluntario']
                                    }
                                ]
                            },

                            {
                                model: db.detalle_stands,
                                as: 'detallesStands',
                                attributes: ['idDetalleStands', 'cantidad', 'estado', 'idProducto'],
                                include: [
                                    {
                                        model: db.productos,
                                        as: 'producto',
                                        attributes: ['idProducto', 'nombreProducto', 'precio']
                                    }
                                ],
                            }
                        ],
                    }
                ]
            });

            return res.status(200).send(detalles);
        } catch (error) {
            console.error('Error al recuperar los detalles de venta:', error);
            return res.status(500).send({ message: 'Ocurrió un error al recuperar los detalles de venta.' });
        }
    },

    // * detalles con estado 1
    async findInactive(req, res) {
        try {
            const detalles = await DETALLE_VENTAS_STANDS.findAll({
                where: { estado: 0 },
                include: [
                    {
                        model: VENTAS,
                        attributes: ['idVenta', 'totalVenta', 'fechaVenta']
                    },
                    {
                        model: PRODUCTOS,
                        attributes: ['idProducto', 'nombreProducto', 'precio']
                    },
                    {
                        model: STANDS,
                        attributes: ['idStand', 'nombreStand', 'direccion', 'idTipoStands'],
                        include: [
                            {
                                model: db.asignacion_stands,
                                as: 'asignaciones',
                                attributes: ['idAsignacionStands', 'idStand', 'idInscripcionEvento', 'idDetalleHorario'],
                                include: [
                                    {
                                        model: db.inscripcion_eventos,
                                        as: 'inscripcionEvento',
                                        attributes: ['idInscripcionEvento', 'idEvento', 'idVoluntario']
                                    }
                                ]
                            },

                            {
                                model: db.detalle_stands,
                                as: 'detallesStands',
                                attributes: ['idDetalleStands', 'cantidad', 'estado', 'idProducto'],
                                include: [
                                    {
                                        model: db.productos,
                                        as: 'producto',
                                        attributes: ['idProducto', 'nombreProducto', 'precio']
                                    }
                                ],
                            }
                        ],
                    }
                ]
            });

            return res.status(200).send(detalles);
        } catch (error) {
            console.error('Error al recuperar los detalles de venta:', error);
            return res.status(500).send({ message: 'Ocurrió un error al recuperar los detalles de venta.' });
        }
    },

    // * Obtener un detalle de venta por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const detalle = await DETALLE_VENTAS_STANDS.findByPk(id, {
                include: [
                    {
                        model: VENTAS,
                        attributes: ['idVenta', 'totalVenta', 'fechaVenta']
                    },
                    {
                        model: PRODUCTOS,
                        attributes: ['idProducto', 'nombreProducto', 'precio']
                    },
                    {
                        model: STANDS,
                        attributes: ['idStand', 'nombreStand', 'direccion', 'idTipoStands'],
                        include: [
                            {
                                model: db.asignacion_stands,
                                as: 'asignaciones',
                                attributes: ['idAsignacionStands', 'idStand', 'idInscripcionEvento', 'idDetalleHorario'],
                                include: [
                                    {
                                        model: db.inscripcion_eventos,
                                        as: 'inscripcionEvento',
                                        attributes: ['idInscripcionEvento', 'idEvento', 'idVoluntario']
                                    }
                                ]
                            },

                            {
                                model: db.detalle_stands,
                                as: 'detallesStands',
                                attributes: ['idDetalleStands', 'cantidad', 'estado', 'idProducto'],
                                include: [
                                    {
                                        model: db.productos,
                                        as: 'producto',
                                        attributes: ['idProducto', 'nombreProducto', 'precio']
                                    }
                                ],
                            }
                        ],
                    }
                ]
            });

            if (!detalle) {
                return res.status(404).send({ message: 'Detalle de venta no encontrado.' });
            }

            return res.status(200).send(detalle);
        } catch (error) {
            console.error('Error al recuperar el detalle de venta:', error);
            return res.status(500).send({ message: 'Ocurrió un error al recuperar el detalle de venta.' });
        }
    },

    // * Crear un nuevo detalle de venta
    async create(req, res) {
        const datos = req.body;

        // Validar los datos del detalle de venta
        const error = validateDetalleVentaData(datos);
        if (error) {
            return res.status(400).send({ error });
        }

        const nuevoDetalleVenta = {
            cantidad: datos.cantidad,
            subTotal: datos.subTotal,
            donacion: datos.donacion || 0.00,
            estado: datos.estado || 1,
            idVenta: datos.idVenta,
            idProducto: datos.idProducto,
            idStand: datos.idStand
        };

        try {
            const detalleCreado = await DETALLE_VENTAS_STANDS.create(nuevoDetalleVenta);
            return res.status(201).send(detalleCreado);
        } catch (error) {
            console.error('Error al crear el detalle de venta:', error);
            return res.status(500).send({ message: 'Ocurrió un error al crear el detalle de venta.' });
        }
    },

    // * Actualizar un detalle de venta
    async update(req, res) {
        const id = req.params.id;
        const datos = req.body;

        // Validar los datos del detalle de venta
        const error = validateDetalleVentaData(datos);
        if (error) {
            return res.status(400).send({ error });
        }

        const camposActualizados = {};

        if (datos.cantidad !== undefined) camposActualizados.cantidad = datos.cantidad;
        if (datos.subTotal !== undefined) camposActualizados.subTotal = datos.subTotal;
        if (datos.donacion !== undefined) camposActualizados.donacion = datos.donacion;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
        if (datos.idVenta !== undefined) camposActualizados.idVenta = datos.idVenta;
        if (datos.idProducto !== undefined) camposActualizados.idProducto = datos.idProducto;
        if (datos.idStand !== undefined) camposActualizados.idStand = datos.idStand;

        try {
            const [rowsUpdated] = await DETALLE_VENTAS_STANDS.update(camposActualizados, {
                where: { idDetalleVentaStand: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).send({ message: 'Detalle de venta no encontrado.' });
            }

            return res.status(200).send({ message: 'El detalle de venta ha sido actualizado exitosamente.' });
        } catch (error) {
            console.error('Error al actualizar el detalle de venta:', error);
            return res.status(500).send({ message: 'Ocurrió un error al actualizar el detalle de venta.' });
        }
    },

    async obtenerReportePlayeras(req, res) {
        try {
          const { fechaInicio, fechaFin } = req.query;
    
          // Verificar que las fechas se proporcionen
          if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ message: 'Se requieren las fechas de inicio y fin.' });
          }
    
          // Convertir las fechas de formato DD-MM-YYYY a YYYY-MM-DD
          const fechaInicioFormato = fechaInicio.split("-").reverse().join("-");
          const fechaFinFormato = fechaFin.split("-").reverse().join("-");
    
          // Validar que las fechas sean válidas
          const fechaInicioValida = moment(fechaInicioFormato, 'YYYY-MM-DD', true).isValid();
          const fechaFinValida = moment(fechaFinFormato, 'YYYY-MM-DD', true).isValid();
    
          if (!fechaInicioValida || !fechaFinValida) {
            return res.status(400).json({ message: 'Las fechas no son válidas. Formato esperado: DD-MM-YYYY' });
          }
    
          // Realizar la consulta para obtener los stands con los detalles de las ventas y las asignaciones de productos
          const standsConReporte = await STANDS.findAll({
            include: [
              {
                model: DETALLE_VENTAS_STANDS,  // Incluir detalles de ventas de stands
                include: [
                  {
                    model: PRODUCTOS,
                    where: {
                      idCategoria: 1  // Solo seleccionamos los productos de tipo 'Playera'
                    },
                    attributes: ['idProducto', 'nombreProducto', 'talla']
                  }
                ],
                where: {
                  estado: 1, // Solo activos
                  createdAt: {
                    [Op.gte]: fechaInicioFormato,  // Rango de fechas
                    [Op.lte]: fechaFinFormato
                  }
                }
              },
              {
                model: DETALLE_STANDS, // Incluir detalles de asignaciones de productos a stands
                include: [
                  {
                    model: PRODUCTOS,
                    where: {
                      idCategoria: 1 // Solo productos de tipo 'Playera'
                    },
                    attributes: ['idProducto', 'nombreProducto', 'talla']
                  }
                ],
                where: {
                  estado: 1, // Solo activos
                }
              }
            ]
          });
    
          // Verificación si se encontró algún stand
          if (standsConReporte.length === 0) {
            return res.status(404).json({ message: 'No se encontraron stands con las condiciones especificadas.' });
          }
    
          // Preparar los resultados
          const resultados = [];
    
          for (const stand of standsConReporte) {
            const playerasAsignadas = {};
            const playerasVendidas = {};
            const subtotalesVendidos = {}; // Para almacenar subtotales por talla
            let totalRecaudado = 0; // Inicializar el total recaudado por stand
    
            // Asignación de playeras por talla (detalle_stands)
            stand.detallesStands.forEach((detalle) => {
              if (detalle.producto) {
                const talla = detalle.producto.talla;
                playerasAsignadas[talla] = (playerasAsignadas[talla] || 0) + detalle.cantidad;
              }
            });
    
            // Ventas de playeras por talla (detalle_ventas_stands)
            stand.detalleVentas.forEach((detalleVenta) => {
              if (detalleVenta.producto) {
                const talla = detalleVenta.producto.talla;
                playerasVendidas[talla] = (playerasVendidas[talla] || 0) + detalleVenta.cantidad;
    
                // Calcular el subtotal para cada venta de playera
                const subTotal = parseFloat(detalleVenta.subTotal) || 0;  // Convertir a número (flotante)
                subtotalesVendidos[talla] = (subtotalesVendidos[talla] || 0) + subTotal;
                totalRecaudado += subTotal; // Sumar el subtotal al total recaudado
              }
            });
    
            // Agregar el reporte del stand, incluyendo los subtotales de cada talla y el total recaudado
            resultados.push({
              nombreStand: stand.nombreStand,
              playerasAsignadas,
              playerasVendidas,
              subtotalesVendidos,
              totalRecaudado: parseInt(totalRecaudado) // Redondear el total recaudado a un número entero
            });
          }
    
          // Enviar el reporte como respuesta
          return res.status(200).json({ reporte: resultados });
    
        } catch (error) {
          console.error('Error al obtener el reporte de playeras:', error);
          return res.status(500).json({ message: 'Error al obtener el reporte de playeras.' });
    }
    }

};