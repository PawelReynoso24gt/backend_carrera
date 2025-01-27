// ! Controlador de horarios
'use strict';
const Sequelize = require('sequelize');
const db = require('../models');
const Horarios = db.horarios;

// * Función para formatear a HH:MM:00
function formatTimeToHHMM(time) {
    const timeRegex = /^\d{2}:\d{2}$/; // Solo HH:MM
    if (!timeRegex.test(time)) {
        return null; // No válido
    }
    return `${time}:00`; // Añadir los segundos como 00
}

// * Función para validar los datos para create y update
function validateData(data) {
    const timeRegex = /^\d{2}:\d{2}:\d{2}$/; // Para validación final HH:MM:SS

    if (data.horarioInicio !== undefined && data.horarioFinal !== undefined) {
        if (data.horarioInicio >= data.horarioFinal) {
            return 'El horario de inicio debe ser menor al horario final';
        }
    }
    if (data.estado !== undefined) {
        if (data.estado !== 0 && data.estado !== 1) {
            return 'El campo estado debe ser 0 o 1';
        }
    }

    return null;
}

module.exports = {
    // * Obtener horarios activos
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

    // * Obtener todos los horarios
    async findAll(req, res) {
        try {
            const horarios = await Horarios.findAll();
            return res.status(200).send(horarios);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * Obtener horario por ID
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
    
        // Validar los datos antes de insertarlos
        const error = validateData(datos);
        if (error) {
            return res.status(400).json({ error });
        }
    
        const data = {
            horarioInicio: datos.horarioInicio,
            horarioFinal: datos.horarioFinal,
            estado: datos.estado !== undefined ? datos.estado : 1 // Valor predeterminado de estado: 1
        };

        try {
            const newHorario = await Horarios.create(data);
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
    
        // Validar los datos antes de actualizarlos
        const error = validateData(datos);
        if (error) {
            return res.status(400).json({ error });
        }

        const camposActualizados = {};

        if (datos.horarioInicio !== undefined) {
            camposActualizados.horarioInicio = formatTimeToHHMM(datos.horarioInicio);
        }
        if (datos.horarioFinal !== undefined) {
            camposActualizados.horarioFinal = formatTimeToHHMM(datos.horarioFinal);
        }
        if (datos.estado !== undefined) {
            camposActualizados.estado = datos.estado;
        }

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
