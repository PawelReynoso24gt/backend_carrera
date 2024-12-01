// ! Controlador de Ventas
'use strict';

const db = require('../models');
const VENTAS = db.ventas;
const TIPO_PUBLICOS = db.tipo_publicos;
const STANDS = db.stands;

// Validación de entrada
function validateVentaData(datos) {
    if (datos.totalVenta !== undefined && datos.totalVenta <= 0) {
        return 'El total de la venta debe ser mayor a 0.';
    }

    if (datos.fechaVenta === undefined) {
        return 'La fecha de la venta es obligatoria.';
    }

    if (datos.idTipoPublico !== undefined && datos.idTipoPublico < 1) {
        return 'El tipo de público es inválido.';
    }

    if (datos.idStand !== undefined && datos.idStand < 1) {
        return 'El stand es inválido.';
    }

    return null;
}

module.exports = {
    // * Obtener todas las ventas
    async findAll(req, res) {
        try {
            const ventas = await VENTAS.findAll({
                include: [
                    {
                        model: TIPO_PUBLICOS,
                        attributes: ['nombreTipo']
                    },
                    {
                        model: STANDS,
                        attributes: ['nombreStand', 'direccion']
                    }
                ]
            });

            return res.status(200).send(ventas);
        } catch (error) {
            console.error('Error al recuperar las ventas:', error);
            return res.status(500).send({ message: 'Ocurrió un error al recuperar las ventas.' });
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
                        attributes: ['nombreTipo']
                    },
                    {
                        model: STANDS,
                        attributes: ['nombreStand', 'direccion']
                    }
                ]
            });

            if (!venta) {
                return res.status(404).send({ message: 'Venta no encontrada.' });
            }

            return res.status(200).send(venta);
        } catch (error) {
            console.error('Error al recuperar la venta:', error);
            return res.status(500).send({ message: 'Ocurrió un error al recuperar la venta.' });
        }
    },

    // * Crear una nueva venta
    async create(req, res) {
        const datos = req.body;

        // Validar los datos de la venta
        const error = validateVentaData(datos);
        if (error) {
            return res.status(400).send({ error });
        }

        const nuevaVenta = {
            totalVenta: datos.totalVenta,
            fechaVenta: datos.fechaVenta,
            estado: datos.estado || 1,
            idTipoPublico: datos.idTipoPublico,
            idStand: datos.idStand
        };

        try {
            const ventaCreada = await VENTAS.create(nuevaVenta);
            return res.status(201).send(ventaCreada);
        } catch (error) {
            console.error('Error al crear la venta:', error);
            return res.status(500).send({ message: 'Ocurrió un error al crear la venta.' });
        }
    },

    // * Actualizar una venta
    async update(req, res) {
        const id = req.params.id;
        const datos = req.body;

        // Validar los datos de la venta
        const error = validateVentaData(datos);
        if (error) {
            return res.status(400).send({ error });
        }

        const camposActualizados = {};

        if (datos.totalVenta !== undefined) camposActualizados.totalVenta = datos.totalVenta;
        if (datos.fechaVenta !== undefined) camposActualizados.fechaVenta = datos.fechaVenta;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
        if (datos.idTipoPublico !== undefined) camposActualizados.idTipoPublico = datos.idTipoPublico;
        if (datos.idStand !== undefined) camposActualizados.idStand = datos.idStand;

        try {
            const [rowsUpdated] = await VENTAS.update(camposActualizados, {
                where: { idVenta: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).send({ message: 'Venta no encontrada.' });
            }

            return res.status(200).send({ message: 'La venta ha sido actualizada exitosamente.' });
        } catch (error) {
            console.error('Error al actualizar la venta:', error);
            return res.status(500).send({ message: 'Ocurrió un error al actualizar la venta.' });
        }
    }
};