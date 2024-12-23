// ! Controlador de Ventas
'use strict';

const { zonedTimeToUtc, format } = require('date-fns-tz');
const { parse, isValid } = require('date-fns'); // isValid para validar fechas
const db = require('../models');
const VENTAS = db.ventas;
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
};
