// ! Controlador de horarios
'use strict';
const Sequelize = require('sequelize');
const db = require('../models');
const Horarios = db.horarios;

module.exports = {
    // * Get horarios activos
    async find(req, res) {
        try {
            const horarios = await Horarios.findAll({
                where: {
                    estado: 1 // Filtrar por estado 1
                }
            });
            return res.status(200).send(horarios);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * Get todos los horarios
    async find_all(req, res) {
        try {
            const horarios = await Horarios.findAll();
            return res.status(200).send(horarios);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * Get horario por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const horario = await Horarios.findByPk(id);
            if (!horario) {
                return res.status(404).send({
                    message: 'Horario no encontrado.'
                });
            }
            return res.status(200).send(horario);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al intentar recuperar el registro.'
            });
        }
    },

    // * Crear horario
    async create(req, res) {
        const datos = req.body;
        const datos_ingreso = {
            horarioInicio: datos.horarioInicio,
            horarioFinal: datos.horarioFinal,
            estado: 1 // Estado activo por defecto
        };

        try {
            const newHorario = await Horarios.create(datos_ingreso);
            return res.status(201).send(newHorario);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al insertar horario' });
        }
    },

    // * Actualizar horario
    async update(req, res) {
        const datos = req.body;
        const id = req.params.id;

        const camposActualizados = {};

        if (datos.horarioInicio !== undefined) camposActualizados.horarioInicio = datos.horarioInicio;
        if (datos.horarioFinal !== undefined) camposActualizados.horarioFinal = datos.horarioFinal;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado; // Permite actualizar el estado

        try {
            const [rowsUpdated] = await Horarios.update(camposActualizados, {
                where: { idHorario: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).send({ message: 'Horario no encontrado' });
            }

            return res.status(200).send('El horario ha sido actualizado');
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al actualizar horario' });
        }
    },

    // * Eliminar horario
    async delete(req, res) {
        const id = req.params.id;

        try {
            const horario = await Horarios.findByPk(id);
            if (!horario) {
                return res.status(404).json({ error: 'Horario no encontrado' });
            }

            await horario.destroy();
            return res.json({ message: 'Horario eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar horario:', error);
            return res.status(500).json({ error: 'Error al eliminar horario' });
        }
    }
};