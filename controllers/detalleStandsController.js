'use strict';
const { format } = require('date-fns-tz');
const db = require('../models');
const DETALLE_STANDS = db.detalle_stands;
const PRODUCTOS = db.productos;
const STANDS = db.stands;
const DETALLE_PRODUCTOS = db.detalle_productos;
module.exports = {
    // Obtener todos los detalles de stands
    async find(req, res) {
        try {
            const detalles = await DETALLE_STANDS.findAll({
                include: [
                    {
                        model: PRODUCTOS,
                        as: 'producto',
                        attributes: ['idProducto', 'nombreProducto', 'precio']
                    },
                    {
                        model: STANDS,
                        as: 'stand',
                        attributes: ['idStand', 'nombreStand', 'direccion']
                    }
                ],
                where: { estado: 1 } // Solo activos por defecto
            });
            return res.status(200).json(detalles);
        } catch (error) {
            console.error('Error al recuperar los detalles de stands:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los detalles de stands.'
            });
        }
    },

    // Obtener detalles de stands activos
    async findActive(req, res) {
        try {
            const detalles = await DETALLE_STANDS.findAll({
                where: { estado: 1 },
                include: [
                    {
                        model: PRODUCTOS,
                        as: 'producto',
                        attributes: ['idProducto', 'nombreProducto', 'precio']
                    },
                    {
                        model: STANDS,
                        as: 'stand',
                        attributes: ['idStand', 'nombreStand']
                    }
                ]
            });
            return res.status(200).json(detalles);
        } catch (error) {
            console.error('Error al listar los detalles activos:', error);
            return res.status(500).json({
                message: 'Error al listar los detalles activos.'
            });
        }
    },

    // Obtener detalles de stands inactivos
    async findInactive(req, res) {
        try {
            const detalles = await DETALLE_STANDS.findAll({
                where: { estado: 0 },
                include: [
                    {
                        model: PRODUCTOS,
                        as: 'producto',
                        attributes: ['idProducto', 'nombreProducto', 'precio']
                    },
                    {
                        model: STANDS,
                        as: 'stand',
                        attributes: ['idStand', 'nombreStand']
                    }
                ]
            });
            return res.status(200).json(detalles);
        } catch (error) {
            console.error('Error al listar los detalles inactivos:', error);
            return res.status(500).json({
                message: 'Error al listar los detalles inactivos.'
            });
        }
    },

    // Obtener un detalle por ID
    async findById(req, res) {
        const id = req.params.id;
        try {
            const detalle = await DETALLE_STANDS.findByPk(id, {
                include: [
                    {
                        model: PRODUCTOS,
                        as: 'producto',
                        attributes: ['idProducto', 'nombreProducto', 'precio']
                    },
                    {
                        model: STANDS,
                        as: 'stand',
                        attributes: ['idStand', 'nombreStand', 'direccion']
                    }
                ]
            });

            if (!detalle) {
                return res.status(404).json({ message: 'Detalle no encontrado' });
            }

            return res.status(200).json(detalle);
        } catch (error) {
            console.error(`Error al buscar el detalle con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar el detalle.'
            });
        }
    },

    // Crear un nuevo detalle
    async create(req, res) {
        const { cantidad, idProducto, idStand } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1;

        if (!cantidad || !idProducto || !idStand) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            // Verificar si hay suficiente inventario en detalle_productos
            const detalleProducto = await DETALLE_PRODUCTOS.findOne({
                where: { idProducto, estado: 1 },
            });

            if (!detalleProducto) {
                return res.status(400).json({ message: 'No hay inventario disponible para el producto especificado.' });
            }

            if (detalleProducto.cantidad < cantidad) {
                return res.status(400).json({
                    message: `No hay suficiente inventario. Disponible: ${detalleProducto.cantidad}`,
                });
            }

            // Descontar la cantidad del inventario
            detalleProducto.cantidad -= cantidad;
            await detalleProducto.save();

            // Crear el nuevo detalle
            const nuevoDetalle = await DETALLE_STANDS.create({
                cantidad,
                estado,
                idProducto,
                idStand,
            });

            return res.status(201).json({
                message: 'Detalle creado con éxito',
                createdDetalle: nuevoDetalle,
            });
        } catch (error) {
            console.error('Error al crear el detalle:', error);
            return res.status(500).json({ message: 'Error al crear el detalle.' });
        }
    },

    // Actualizar un detalle y ajustar el inventario
    async update(req, res) {
        const { cantidad, estado, idProducto, idStand } = req.body;
        const id = req.params.id;

        try {
            const detalle = await DETALLE_STANDS.findByPk(id);

            if (!detalle) {
                return res.status(404).json({ message: 'Detalle no encontrado' });
            }

            // Si la cantidad cambió, ajustar el inventario
            if (cantidad !== undefined && idProducto === detalle.idProducto) {
                const detalleProducto = await DETALLE_PRODUCTOS.findOne({
                    where: { idProducto, estado: 1 },
                });

                if (!detalleProducto) {
                    return res.status(400).json({ message: 'No hay inventario disponible para el producto especificado.' });
                }

                // Calcular la diferencia en cantidades
                const diferencia = cantidad - detalle.cantidad;

                if (diferencia > 0 && detalleProducto.cantidad < diferencia) {
                    return res.status(400).json({
                        message: `No hay suficiente inventario para ajustar la cantidad. Disponible: ${detalleProducto.cantidad}`,
                    });
                }

                // Ajustar inventario
                detalleProducto.cantidad -= diferencia;
                await detalleProducto.save();
            }

            // Actualizar los campos
            const camposActualizados = {};
            if (cantidad !== undefined) camposActualizados.cantidad = cantidad;
            if (estado !== undefined) camposActualizados.estado = estado;
            if (idProducto !== undefined) camposActualizados.idProducto = idProducto;
            if (idStand !== undefined) camposActualizados.idStand = idStand;

            const [rowsUpdated] = await DETALLE_STANDS.update(camposActualizados, {
                where: { idDetalleStands: id },
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'No se pudo actualizar el detalle.' });
            }

            const detalleActualizado = await DETALLE_STANDS.findByPk(id, {
                include: [
                    {
                        model: PRODUCTOS,
                        as: 'producto',
                        attributes: ['idProducto', 'nombreProducto', 'precio'],
                    },
                    {
                        model: STANDS,
                        as: 'stand',
                        attributes: ['idStand', 'nombreStand', 'direccion'],
                    },
                ],
            });

            return res.status(200).json({
                message: `El detalle con ID: ${id} ha sido actualizado`,
                updatedDetalle: detalleActualizado,
            });
        } catch (error) {
            console.error(`Error al actualizar el detalle con ID ${id}:`, error);
            return res.status(500).json({ message: 'Error al actualizar el detalle.' });
        }
    },

    // Eliminar un detalle
    async delete(req, res) {
        const id = req.params.id;

        try {
            const detalle = await DETALLE_STANDS.findByPk(id);

            if (!detalle) {
                return res.status(404).json({ message: 'Detalle no encontrado' });
            }

            await detalle.destroy();
            return res.status(200).json({ message: 'Detalle eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar el detalle:', error);
            return res.status(500).json({ message: 'Error al eliminar el detalle.' });
        }
    }
};
