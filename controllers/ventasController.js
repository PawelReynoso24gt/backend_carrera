// ! Controlador de Ventas
'use strict';

const db = require('../models');
const VENTAS = db.ventas;
const TIPO_PUBLICOS = db.tipo_publicos;
const STANDS = db.stands;

// Validación de entrada
function validateVentaData(datos) {
    if (datos.totalVenta !== undefined) {
        if (isNaN(datos.totalVenta) || datos.totalVenta <= 0) {
            return { error: 'El total de la venta debe ser un número mayor a 0.' };
        }
    }

    if (datos.fechaVenta !== undefined) {
        if (isNaN(Date.parse(datos.fechaVenta))) {
            return { error: 'La fecha de la venta debe ser una fecha válida.' };
        }
    }

    if (datos.idTipoPublico !== undefined) {
        if (isNaN(datos.idTipoPublico) || datos.idTipoPublico < 1) {
            return { error: 'El tipo de público debe ser un número válido mayor a 0.' };
        }
    }

    if (datos.idStand !== undefined) {
        if (isNaN(datos.idStand) || datos.idStand < 1) {
            return { error: 'El ID del stand debe ser un número válido mayor a 0.' };
        }
    }

    // Verificar que al menos un campo esté presente para actualizaciones
    if (
        datos.totalVenta === undefined &&
        datos.fechaVenta === undefined &&
        datos.idTipoPublico === undefined &&
        datos.idStand === undefined &&
        datos.estado === undefined
    ) {
        return { error: 'Debe proporcionar al menos un campo para actualizar.' };
    }

    if (datos.estado !== undefined) {
        if (datos.estado !== 0 && datos.estado !== 1) {
            return { error: 'El estado debe ser 0 o 1.' };
        }
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