'use strict';

const db = require('../models');
const DETALLE_VENTAS_VOLUNTARIOS = db.detalle_ventas_voluntarios;
const VENTAS = db.ventas;
const PRODUCTOS = db.productos;
const VOLUNTARIOS =db.voluntarios

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

    if (datos.idVoluntario !== undefined) {
        if (isNaN(datos.idVoluntario) || datos.idVoluntario < 1) {
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
        datos.subTotal === undefined &&
        datos.donacion === undefined &&
        datos.idVenta === undefined &&
        datos.idProducto === undefined &&
        datos.idVoluntario === undefined &&
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
            const detalles = await DETALLE_VENTAS_VOLUNTARIOS.findAll({
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
                        model: VOLUNTARIOS,
                        as: 'voluntario',
                        attributes: ['idVoluntario', 'idPersona', 'codigoQR'],
                        include: [
                            {
                                model: db.personas,
                                as: 'persona',
                                attributes: ['idPersona', 'nombre', 'telefono', 'domicilio']
                            },
                            {
                                model: db.detalle_productos_voluntarios,
                                as: 'detalle_productos_voluntarios',
                                attributes: ['idDetalleProductoVoluntario', 'idProducto', 'idVoluntario', 'cantidad'],
                            }
                        ]
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
            const detalles = await DETALLE_VENTAS_VOLUNTARIOS.findAll({
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
                        model: VOLUNTARIOS,
                        as: 'voluntario',
                        attributes: ['idVoluntario', 'idPersona', 'codigoQR'],
                        include: [
                            {
                                model: db.personas,
                                as: 'persona',
                                attributes: ['idPersona', 'nombre', 'telefono', 'domicilio']
                            },
                            {
                                model: db.detalle_productos_voluntarios,
                                as: 'detalle_productos_voluntarios',
                                attributes: ['idDetalleProductoVoluntario', 'idProducto', 'idVoluntario', 'cantidad']
                            }
                        ]
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
            const detalles = await DETALLE_VENTAS_VOLUNTARIOS.findAll({
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
                        model: VOLUNTARIOS,
                        as: 'voluntario',
                        attributes: ['idVoluntario', 'idPersona', 'codigoQR'],
                        include: [
                            {
                                model: db.personas,
                                as: 'persona',
                                attributes: ['idPersona', 'nombre', 'telefono', 'domicilio']
                            },
                            {
                                model: db.detalle_productos_voluntarios,
                                as: 'detalle_productos_voluntarios',
                                attributes: ['idDetalleProductoVoluntario', 'idProducto', 'idVoluntario', 'cantidad']
                            }
                        ]
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
            const detalle = await DETALLE_VENTAS_VOLUNTARIOS.findByPk(id, {
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
                        model: VOLUNTARIOS,
                        as: 'voluntario',
                        attributes: ['idVoluntario', 'idPersona', 'codigoQR'],
                        include: [
                            {
                                model: db.personas,
                                as: 'persona',
                                attributes: ['idPersona', 'nombre', 'telefono', 'domicilio']
                            },
                            {
                                model: db.detalle_productos_voluntarios,
                                as: 'detalle_productos_voluntarios',
                                attributes: ['idDetalleProductoVoluntario', 'idProducto', 'idVoluntario', 'cantidad']
                            }
                        ]
                    }
                ]
            });

             // Devolver un arreglo vacío si no se encuentra el detalle
            if (!detalle) {
                return res.status(200).send([]);
            }

            // Si se encuentra, devolver el detalle en un arreglo
            return res.status(200).send([detalle]);
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
            subTotal: datos.subTotal || 0.00,
            donacion: datos.donacion || 0.00,
            estado: datos.estado || 1,
            idVenta: datos.idVenta,
            idProducto: datos.idProducto,
            idVoluntario: datos.idVoluntario
        };

        try {
            const detalleCreado = await DETALLE_VENTAS_VOLUNTARIOS.create(nuevoDetalleVenta);
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
        if (datos.idVoluntario !== undefined) camposActualizados.idVoluntario = datos.idVoluntario;

        try {
            const [rowsUpdated] = await DETALLE_VENTAS_VOLUNTARIOS.update(camposActualizados, {
                where: { idDetalleVentaVoluntario: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).send({ message: 'Detalle de venta no encontrado.' });
            }

            return res.status(200).send({ message: 'El detalle de venta ha sido actualizado exitosamente.' });
        } catch (error) {
            console.error('Error al actualizar el detalle de venta:', error);
            return res.status(500).send({ message: 'Ocurrió un error al actualizar el detalle de venta.' });
        }
    }
};