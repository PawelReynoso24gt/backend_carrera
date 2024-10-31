// ! Controlador de detalle_horarios
'use strict';
const Sequelize = require('sequelize');
const db = require('../models');
const DetalleHorarios = db.detalle_horarios;

module.exports = {
    // * Get detalles de horarios activos
    async find(req, res) {
        try {
            const detalles = await DetalleHorarios.findAll({
                where: {
                    estado: 1 // Filtrar por estado 1
                },
                include: ['horario', 'categoriaHorario']
            });
            return res.status(200).send(detalles);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * Get todos los detalles de horarios
    async find_all(req, res) {
        try {
            const detalles = await DetalleHorarios.findAll({
                include: ['horario', 'categoriaHorario']
            });
            return res.status(200).send(detalles);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * Get detalle de horario por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const detalle = await DetalleHorarios.findByPk(id, {
                include: ['horario', 'categoriaHorario']
            });
            if (!detalle) {
                return res.status(404).send({
                    message: 'Detalle de horario no encontrado.'
                });
            }
            return res.status(200).send(detalle);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al intentar recuperar el registro.'
            });
        }
    },

    // * Crear detalle de horario
    async create(req, res) {
        const datos = req.body;
        const datos_ingreso = {
            cantidadPersonas: datos.cantidadPersonas,
            estado: datos.estado,
            idHorario: datos.idHorario,
            idCategoriaHorario: datos.idCategoriaHorario
        };

        try {
            const newDetalle = await DetalleHorarios.create(datos_ingreso);
            return res.status(201).send(newDetalle);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al insertar detalle de horario' });
        }
    },

    // * Actualizar detalle de horario
    async update(req, res) {
        const datos = req.body;
        const id = req.params.id;

        const camposActualizados = {};

        if (datos.cantidadPersonas !== undefined) camposActualizados.cantidadPersonas = datos.cantidadPersonas;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
        if (datos.idHorario !== undefined) camposActualizados.idHorario = datos.idHorario;
        if (datos.idCategoriaHorario !== undefined) camposActualizados.idCategoriaHorario = datos.idCategoriaHorario;

        try {
            const [rowsUpdated] = await DetalleHorarios.update(camposActualizados, {
                where: { idDetalleHorario: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).send({ message: 'Detalle de horario no encontrado' });
            }

            return res.status(200).send('El detalle de horario ha sido actualizado');
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al actualizar detalle de horario' });
        }
    },

    // * Eliminar detalle de horario
    async delete(req, res) {
        const id = req.params.id;

        try {
            const detalle = await DetalleHorarios.findByPk(id);
            if (!detalle) {
                return res.status(404).json({ error: 'Detalle de horario no encontrado' });
            }

            await detalle.destroy();
            return res.json({ message: 'Detalle de horario eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar detalle de horario:', error);
            return res.status(500).json({ error: 'Error al eliminar detalle de horario' });
        }
    }
};