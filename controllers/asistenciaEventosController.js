'use strict';
const { zonedTimeToUtc, format } = require('date-fns-tz');
const db = require('../models');
const ASISTENCIA_EVENTOS = db.asistencia_eventos;
const EMPLEADOS = db.empleados;
const INSCRIPCION_EVENTOS = db.inscripcion_eventos;
const EVENTOS = db.eventos;
const VOLUNTARIOS = db.voluntarios;
const PERSONAS = db.personas; 

module.exports = {
    // Obtener todas las asistencias
    async find(req, res) {
        try {
            const asistencias = await ASISTENCIA_EVENTOS.findAll({
                include: [
                    {
                        model: EMPLEADOS,
                        as: 'empleado',
                        attributes: ['idEmpleado'],
                        include: [
                            {
                                model: PERSONAS,
                                as: 'persona',
                                attributes: ['nombre']
                            }
                        ]
                    },
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado', 'idEvento'],
                        include: [
                            {
                                model: EVENTOS, 
                                as: 'evento',    
                                attributes: ['idEvento', 'nombreEvento'] // Atributos que deseas obtener
                            },
                            {
                                model: VOLUNTARIOS,
                                as: 'voluntario',
                                attributes: ['idVoluntario'],
                                include:
                                [
                                    {
                                        model: PERSONAS,
                                        as: 'persona',
                                        attributes:['nombre']
                                    }
                                ]
                            }
                        ]
                    }
                ],
                where: { estado: 1 } // Solo activos por defecto
            });
            return res.status(200).json(asistencias);
        } catch (error) {
            console.error('Error al recuperar las asistencias:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar las asistencias.'
            });
        }
    },

    // Obtener asistencias por evento
    async findByEvento(req, res) {
        const { idEvento } = req.params; // Obtener el ID del evento desde los parámetros de la URL
    
        if (!idEvento) {
            return res.status(400).json({ message: 'Se requiere el ID del evento.' });
        }
    
        try {
            // Buscar asistencias relacionadas con el evento
            const asistencias = await ASISTENCIA_EVENTOS.findAll({
                include: [
                    {
                        model: EMPLEADOS,
                        as: 'empleado',
                        attributes: ['idEmpleado'],
                        include: [
                            {
                                model: PERSONAS,
                                as: 'persona',
                                attributes: ['nombre']
                            }
                        ]
                    },
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        where: { idEvento, estado: 1}, // Filtrar por el ID del evento
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado', 'idEvento'],
                        include: [
                            {
                                model: EVENTOS,
                                as: 'evento',
                                attributes: ['idEvento', 'nombreEvento']
                            },
                            {
                                model: VOLUNTARIOS,
                                as: 'voluntario',
                                attributes: ['idVoluntario'],
                                include: [
                                    {
                                        model: PERSONAS,
                                        as: 'persona',
                                        attributes: ['nombre']
                                    }
                                ]
                            }
                        ]
                    }
                ],
                where: { estado: 1 } // Solo asistencias activas
            });
    
            if (asistencias.length === 0) {
                return res.status(404).json({ message: 'No se encontraron asistencias para este evento.' });
            }
    
            return res.status(200).json(asistencias);
        } catch (error) {
            console.error('Error al recuperar asistencias por evento:', error);
            return res.status(500).json({ message: 'Error al recuperar asistencias por evento.' });
        }
    },

    // Obtener asistencias activas
    async findActive(req, res) {
        try {
            const asistencias = await ASISTENCIA_EVENTOS.findAll({
                where: { estado: 1 },
                include: [
                    {
                        model: EMPLEADOS,
                        as: 'empleado',
                        attributes: ['idEmpleado', 'fechaRegistro', 'fechaSalida', 'estado']
                    },
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    }
                ]
            });
            return res.status(200).json(asistencias);
        } catch (error) {
            console.error('Error al listar las asistencias activas:', error);
            return res.status(500).json({
                message: 'Error al listar las asistencias activas.'
            });
        }
    },

    // Obtener asistencias inactivas
    async findInactive(req, res) {
        try {
            const asistencias = await ASISTENCIA_EVENTOS.findAll({
                where: { estado: 0 },
                include: [
                    {
                        model: EMPLEADOS,
                        as: 'empleado',
                        attributes: ['idEmpleado', 'fechaRegistro', 'fechaSalida', 'estado']
                    },
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    }
                ]
            });
            return res.status(200).json(asistencias);
        } catch (error) {
            console.error('Error al listar las asistencias inactivas:', error);
            return res.status(500).json({
                message: 'Error al listar las asistencias inactivas.'
            });
        }
    },

    // Obtener una asistencia por ID
    async findById(req, res) {
        const id = req.params.id;
        try {
            const asistencia = await ASISTENCIA_EVENTOS.findByPk(id, {
                include: [
                    {
                        model: EMPLEADOS,
                        as: 'empleado',
                        attributes: ['idEmpleado', 'fechaRegistro', 'fechaSalida', 'estado']
                    },
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    }
                ]
            });

            if (!asistencia) {
                return res.status(404).json({ message: 'Asistencia no encontrada' });
            }

            return res.status(200).json(asistencia);
        } catch (error) {
            console.error(`Error al buscar la asistencia con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar la asistencia.'
            });
        }
    },

    
    // Crear una nueva asistencia
    async create(req, res) {
        const { idInscripcionEvento, idEmpleado } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1;

        if (!idInscripcionEvento || !idEmpleado) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            // Verificar si ya existe una asistencia para este idInscripcionEvento
            const asistenciaExistente = await ASISTENCIA_EVENTOS.findOne({
                where: { idInscripcionEvento }
            });

            if (asistenciaExistente) {
                return res.status(400).json({
                    message: 'Ya existe una asistencia registrada para este evento.'
                });
            }

            const nuevaAsistencia = await ASISTENCIA_EVENTOS.create({
                estado,
                idInscripcionEvento,
                idEmpleado,
                fechaHoraAsistencia: new Date() // Agregar la fecha y hora actual
            });

           // Formatear la fecha para la respuesta
            const asistenciaConFormato = {
                ...nuevaAsistencia.toJSON(),
                fechaHoraAsistencia: format(
                    new Date(nuevaAsistencia.fechaHoraAsistencia),"yyyy-MM-dd HH:mm:ss", {
                    timeZone: "America/Guatemala"
                })
            };

            return res.status(201).json({
                message: 'Asistencia creada con éxito',
                createdAsistencia: asistenciaConFormato
            });
        } catch (error) {
            console.error('Error al crear la asistencia:', error);
            return res.status(500).json({ message: 'Error al crear la asistencia.' });
        }
    },

    // Actualizar una asistencia existente
    async update(req, res) {
        const { estado, idInscripcionEvento, idEmpleado } = req.body;
        const id = req.params.id;

        const camposActualizados = {};
        if (estado !== undefined) camposActualizados.estado = estado;
        if (idInscripcionEvento !== undefined) camposActualizados.idInscripcionEvento = idInscripcionEvento;
        if (idEmpleado !== undefined) camposActualizados.idEmpleado = idEmpleado;

        try {
            const [rowsUpdated] = await ASISTENCIA_EVENTOS.update(camposActualizados, {
                where: { idAsistenciaEvento: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Asistencia no encontrada' });
            }

            const asistenciaActualizada = await ASISTENCIA_EVENTOS.findByPk(id, {
                include: [
                    {
                        model: EMPLEADOS,
                        as: 'empleado',
                        attributes: ['idEmpleado', 'fechaRegistro', 'fechaSalida', 'estado']
                    },
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    }
                ]
            });

            return res.status(200).json({
                message: `La asistencia con ID: ${id} ha sido actualizada`,
                updatedAsistencia: asistenciaActualizada
            });
        } catch (error) {
            console.error(`Error al actualizar la asistencia con ID ${id}:`, error);
            return res.status(500).json({ message: 'Error al actualizar la asistencia.' });
        }
    },

    // Eliminar una asistencia
    async delete(req, res) {
        const id = req.params.id;

        try {
            const asistencia = await ASISTENCIA_EVENTOS.findByPk(id);

            if (!asistencia) {
                return res.status(404).json({ message: 'Asistencia no encontrada' });
            }

            await asistencia.destroy();
            return res.status(200).json({ message: 'Asistencia eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar la asistencia:', error);
            return res.status(500).json({ message: 'Error al eliminar la asistencia.' });
        }
    }
};
