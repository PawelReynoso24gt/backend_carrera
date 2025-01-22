// ! Controlador de stand_horarios
'use strict';
const Sequelize = require('sequelize');
const db = require('../models');
const StandHorarios = db.stand_horarios;

// Validar datos de entrada para create y update
function validateStandHorarioData(data) {
    if (data.idStand !== undefined) {
        if (isNaN(data.idStand) || data.idStand <= 0) {
            return 'El campo idStand debe ser un número positivo';
        }
    }
    return null;
}

module.exports = {
    // * Obtener todos los stand_horarios
    async findAll(req, res) {
        try {
            const horarios = await StandHorarios.findAll({
                include: ['stand', 'detalleHorario'],
            });
            return res.status(200).json(horarios);
        } catch (error) {
            console.error('Error al obtener todos los horarios:', error);
            return res.status(500).json({ error: 'Error al recuperar los horarios' });
        }
    },

    // * Buscar horarios por idStand
    async findByStand(req, res) {
        const idStand = req.params.idStand;

        try {
            const horarios = await StandHorarios.findAll({
                where: { idStand },
                include: [{ model: db.stands, attributes: ['nombreStand'] },

                {
                    model: db.detalle_horarios, attributes: ['cantidadPersonas'],
                    include: [
                        {
                            model: db.horarios,
                            as: 'horario',
                            attributes: ['horarioInicio', 'horarioFinal']
                        }
                    ]
                }],
            });

            if (horarios.length === 0) {
                return res.status(404).json({ message: 'No se encontraron horarios para este stand' });
            }

            return res.status(200).json(horarios);
        } catch (error) {
            console.error('Error al buscar horarios por stand:', error);
            return res.status(500).json({ error: 'Error al buscar horarios por stand' });
        }
    },

    // * Crear un nuevo stand_horario
    async create(req, res) {
        const datos = req.body;

        // Validar los datos de entrada
        const error = validateStandHorarioData(datos);
        if (error) {
            return res.status(400).json({ error });
        }

        const datosIngreso = {
            idStand: datos.idStand,
            idDetalleHorario: datos.idDetalleHorario,
            estado: datos.estado || 1, // Por defecto, estado = 1
        };

        try {

            const nuevoHorario = await StandHorarios.create(datosIngreso);
            return res.status(201).json(nuevoHorario);
        } catch (error) {
            console.error('Error al crear un nuevo horario:', error);
            return res.status(500).json({ error: 'Error al crear un nuevo horario' });
        }
    },

    // * Actualizar un stand_horario
    async update(req, res) {
        const id = req.params.id;
        const datos = req.body;

        // Validar los datos de entrada
        const error = validateStandHorarioData(datos);
        if (error) {
            return res.status(400).json({ error });
        }

        const camposActualizados = {};

        if (datos.idStand !== undefined) camposActualizados.idStand = datos.idStand;
        if (datos.idDetalleHorario !== undefined) camposActualizados.idDetalleHorario = datos.idDetalleHorario;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;

        try {
            const [rowsUpdated] = await StandHorarios.update(camposActualizados, {
                where: { idStandHorario: id },
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Horario no encontrado para actualizar' });
            }

            return res.status(200).json({ message: 'Horario actualizado correctamente' });
        } catch (error) {
            console.error('Error al actualizar el horario:', error);
            return res.status(500).json({ error: 'Error al actualizar el horario' });
        }
    },

    // * Eliminar un stand_horario
    async delete(req, res) {
        const id = req.params.id;

        try {
            const horario = await StandHorarios.findByPk(id);
            if (!horario) {
                return res.status(404).json({ message: 'Horario no encontrado para eliminar' });
            }

            await horario.destroy();
            return res.status(200).json({ message: 'Horario eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar el horario:', error);
            return res.status(500).json({ error: 'Error al eliminar el horario' });
        }
    },
};
