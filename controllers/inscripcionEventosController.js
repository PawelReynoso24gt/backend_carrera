'use strict';
const { zonedTimeToUtc, format } = require('date-fns-tz');
const db = require("../models");
const INSCRIPCION_EVENTOS = db.inscripcion_eventos;
const EVENTOS = db.eventos;
const VOLUNTARIOS = db.voluntarios;

module.exports = {
    // Obtener todas las inscripciones
    async find(req, res) {
        try {
            const inscripciones = await INSCRIPCION_EVENTOS.findAll({
                include: [
                    {
                        model: EVENTOS,
                        as: 'evento',
                        attributes: ['idEvento', 'nombreEvento']
                    },
                    {
                        model: VOLUNTARIOS,
                        as: 'voluntario',
                        attributes: ['idVoluntario', 'estado', 'codigoQR']
                    }
                ],
                where: { estado: 1 }
            });
            return res.status(200).json(inscripciones);
        } catch (error) {
            console.error('Error al recuperar las inscripciones:', error);
            return res.status(500).json({ message: 'Ocurrió un error al recuperar las inscripciones.' });
        }
    },

    // Obtener inscripciones activas
    async findActive(req, res) {
        try {
            const inscripciones = await INSCRIPCION_EVENTOS.findAll({
                where: { estado: 1 },
                include: [
                    {
                        model: EVENTOS,
                        as: 'evento',
                        attributes: ['idEvento', 'nombreEvento']
                    },
                    {
                        model: VOLUNTARIOS,
                        as: 'voluntario',
                        attributes: ['idVoluntario', 'estado', 'codigoQR']
                    }
                ]
            });
            return res.status(200).json(inscripciones);
        } catch (error) {
            console.error('Error al listar las inscripciones activas:', error);
            return res.status(500).json({ message: 'Error al listar las inscripciones activas.' });
        }
    },

    // Obtener inscripciones inactivas
    async findInactive(req, res) {
        try {
            const inscripciones = await INSCRIPCION_EVENTOS.findAll({
                where: { estado: 0 },
                include: [
                    {
                        model: EVENTOS,
                        as: 'evento',
                        attributes: ['idEvento', 'nombreEvento']
                    },
                    {
                        model: VOLUNTARIOS,
                        as: 'voluntario',
                        attributes: ['idVoluntario', 'estado', 'codigoQR']
                    }
                ]
            });
            return res.status(200).json(inscripciones);
        } catch (error) {
            console.error('Error al listar las inscripciones inactivas:', error);
            return res.status(500).json({ message: 'Error al listar las inscripciones inactivas.' });
        }
    },

    // Obtener una inscripción por ID
    async findById(req, res) {
        const id = req.params.id;
        try {
            const inscripcion = await INSCRIPCION_EVENTOS.findByPk(id, {
                include: [
                    {
                        model: EVENTOS,
                        as: 'evento',
                        attributes: ['idEvento', 'nombreEvento']
                    },
                    {
                        model: VOLUNTARIOS,
                        as: 'voluntario',
                        attributes: ['idVoluntario', 'estado', 'codigoQR']
                    }
                ]
            });

            if (!inscripcion) {
                return res.status(404).json({ message: 'Inscripción no encontrada' });
            }

            return res.status(200).json(inscripcion);
        } catch (error) {
            console.error(`Error al buscar la inscripción con ID ${id}:`, error);
            return res.status(500).json({ message: 'Ocurrió un error al recuperar la inscripción.' });
        }
    },

    // Crear una nueva inscripción
    async create(req, res) {
        const { fechaHoraInscripcion, idVoluntario, idEvento } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1;

        if (!fechaHoraInscripcion || !idVoluntario || !idEvento) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            const nuevaInscripcion = await INSCRIPCION_EVENTOS.create({
                fechaHoraInscripcion,
                estado,
                idVoluntario,
                idEvento
            });

            // Formatear la fecha para la respuesta
            const inscripcionConFormato = {
                ...nuevaInscripcion.toJSON(),
                fechaHoraInscripcion: format(new Date(nuevaInscripcion.fechaHoraInscripcion), "yyyy-MM-dd HH:mm:ss", {
                    timeZone: "America/Guatemala"
                })
            };

            return res.status(201).json({
                message: "Inscripción creada con éxito",
                createdInscripcion: inscripcionConFormato
            });
        } catch (error) {
            console.error("Error al crear la inscripción:", error);
            return res.status(500).json({ message: "Error al crear la inscripción." });
        }
    },

    async update(req, res) {
        const { fechaHoraInscripcion, estado, idVoluntario, idEvento } = req.body;
        const id = req.params.id;

        const camposActualizados = {};

        if (fechaHoraInscripcion !== undefined) camposActualizados.fechaHoraInscripcion = fechaHoraInscripcion;
        if (estado !== undefined) camposActualizados.estado = estado;
        if (idVoluntario !== undefined) camposActualizados.idVoluntario = idVoluntario;
        if (idEvento !== undefined) camposActualizados.idEvento = idEvento;

        try {
            const [rowsUpdated] = await INSCRIPCION_EVENTOS.update(camposActualizados, {
                where: { idInscripcionEvento: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Inscripción no encontrada' });
            }

            const inscripcionActualizada = await INSCRIPCION_EVENTOS.findByPk(id, {
                include: [
                    {
                        model: EVENTOS,
                        as: 'evento',
                        attributes: ['idEvento', 'nombreEvento']
                    },
                    {
                        model: VOLUNTARIOS,
                        as: 'voluntario',
                        attributes: ['idVoluntario', 'estado']
                    }
                ]
            });

            // Convertir la fecha al formato deseado para la respuesta
            const inscripcionConFormato = {
                ...inscripcionActualizada.toJSON(),
                fechaHoraInscripcion: format(
                    new Date(inscripcionActualizada.fechaHoraInscripcion),
                    "yyyy-MM-dd HH:mm:ss",
                    { timeZone: "America/Guatemala" }
                )
            };

            return res.status(200).json({
                message: `La inscripción con ID: ${id} ha sido actualizada`,
                updatedInscripcion: inscripcionConFormato
            });
        } catch (error) {
            console.error(`Error al actualizar la inscripción con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar la inscripción' });
        }
    },

    // Eliminar una inscripción
    async delete(req, res) {
        const id = req.params.id;

        try {
            const inscripcion = await INSCRIPCION_EVENTOS.findByPk(id);

            if (!inscripcion) {
                return res.status(404).json({ error: 'Inscripción no encontrada' });
            }

            await inscripcion.destroy();
            return res.status(200).json({ message: 'Inscripción eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar la inscripción:', error);
            return res.status(500).json({ error: 'Error al eliminar la inscripción' });
        }
    }
};