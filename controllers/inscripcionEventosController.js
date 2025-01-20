'use strict';
const { zonedTimeToUtc, format } = require('date-fns-tz');
const db = require("../models");
const ASISTENCIA_EVENTOS = db.asistencia_eventos;
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

    // Obtener inscripciones activas que no tengan asistencia
    async findActive(req, res) {
        try {
            const { eventoId } = req.query;

            // Validar si el id del evento fue proporcionado
            if (!eventoId) {
                return res.status(400).json({ message: 'Se requiere el ID del evento.' });
            }

            const inscripciones = await INSCRIPCION_EVENTOS.findAll({
                where: {
                    estado: 1,
                    idEvento: eventoId,
                },
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
                    },
                    {
                        model: ASISTENCIA_EVENTOS,
                        as: 'asistencias',
                        required: false, // LEFT JOIN para traer asistencias solo si existen
                        attributes: []
                    }
                ],
                // Filtrar solo aquellas inscripciones que no tienen ninguna asistencia asociada
                having: db.Sequelize.literal('COUNT(asistencias.idAsistenciaEvento) = 0'),
                group: ['inscripcion_eventos.idInscripcionEvento']
            });

            return res.status(200).json(inscripciones);
        } catch (error) {
            console.error('Error al listar las inscripciones activas sin asistencia:', error);
            return res.status(500).json({ message: 'Error al listar las inscripciones activas sin asistencia.' });
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

                // Validar si ya existe una inscripción con el mismo idVoluntario e idEvento
            const existente = await INSCRIPCION_EVENTOS.findOne({
                where: {
                    idVoluntario,
                    idEvento
                }
            });

            if (existente) {
                return res.status(400).json({ message: 'El voluntario ya está inscrito en este evento.' });
            }
            
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


            // Obtener las inscripciones asociadas a un voluntario
        async obtenerInscripcionesPorVoluntario(req, res) {
            const { idVoluntario } = req.params;

            try {
                // Buscar la inscripción al evento
                const inscripcionEvento = await INSCRIPCION_EVENTOS.findOne({
                    where: { idVoluntario },
                    attributes: ["idInscripcionEvento"],
                });

                // Buscar la inscripción a la comisión
                const inscripcionComision = await db.inscripcion_comisiones.findOne({
                    where: { idVoluntario },
                    attributes: ["idInscripcionComision"],
                });

                if (!inscripcionEvento || !inscripcionComision) {
                    return res.status(404).json({
                        message: "No se encontraron inscripciones asociadas al voluntario.",
                    });
                }

                // Enviar los datos encontrados
                res.json({
                    idInscripcionEvento: inscripcionEvento.idInscripcionEvento,
                    idInscripcionComision: inscripcionComision.idInscripcionComision,
                });
            } catch (error) {
                console.error("Error al obtener inscripciones del voluntario:", error);
                res.status(500).json({ message: "Error al obtener inscripciones." });
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
            // Validar si ya existe una inscripción con el mismo idVoluntario e idEvento
            if (idVoluntario !== undefined && idEvento !== undefined) {
                const existente = await INSCRIPCION_EVENTOS.findOne({
                    where: {
                        idVoluntario,
                        idEvento,
                        idInscripcionEvento: { [db.Sequelize.Op.ne]: id } // Excluir el registro actual
                    }
                });

                if (existente) {
                    return res.status(400).json({ message: 'El voluntario ya está inscrito en este evento.' });
                }
            }
            
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
    },

    async obtenerInscripciones(req, res) {
        const { idVoluntario } = req.params;
    
        try {
            // Obtener inscripciones activas del voluntario con el evento asociado
            const inscripciones = await INSCRIPCION_EVENTOS.findAll({
                where: { idVoluntario, estado: 1 }, // Solo inscripciones activas
                attributes: ["idInscripcionEvento"],
                include: [
                    {
                        model: EVENTOS,
                        as: "evento",
                        attributes: ["idEvento", "nombreEvento"], // Obtener el id y nombre del evento
                    },
                ],
            });
    
            if (!inscripciones || inscripciones.length === 0) {
                return res.status(404).json({
                    message: "No se encontraron inscripciones asociadas al voluntario.",
                });
            }
    
            // Mapear las inscripciones para incluir los datos requeridos
            const result = inscripciones.map((inscripcion) => ({
                idInscripcionEvento: inscripcion.idInscripcionEvento,
                idEvento: inscripcion.evento.idEvento,
                nombreEvento: inscripcion.evento.nombreEvento, // Incluye el nombre del evento para contexto
            }));
    
            return res.status(200).json(result);
        } catch (error) {
            console.error("Error al obtener inscripciones del voluntario:", error);
            return res
                .status(500)
                .json({ message: "Error al obtener las inscripciones del voluntario." });
        }
    },

    
    
};
