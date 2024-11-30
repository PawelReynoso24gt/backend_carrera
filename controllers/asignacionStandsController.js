'use strict';
const db = require('../models');
const ASIGNACION_STANDS = db.asignacion_stands;
const INSCRIPCION_EVENTOS = db.inscripcion_eventos;
const DETALLE_HORARIOS = db.detalle_horarios;
const STANDS = db.stands;

module.exports = {
    // Obtener todas las asignaciones
    async find(req, res) {
        try {
            const asignaciones = await ASIGNACION_STANDS.findAll({
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    },
                    {
                        model: DETALLE_HORARIOS,
                        as: 'detalleHorario',
                        attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado']
                    },
                    {
                        model: STANDS,
                        as: 'stand',
                        attributes: ['idStand', 'nombreStand', 'direccion']
                    }
                ],
                where: { estado: 1 } // Solo activos por defecto
            });
            return res.status(200).json(asignaciones);
        } catch (error) {
            console.error('Error al recuperar las asignaciones:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar las asignaciones.'
            });
        }
    },

    // Obtener asignaciones activas
    async findActive(req, res) {
        try {
            const asignaciones = await ASIGNACION_STANDS.findAll({
                where: { estado: 1 },
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    },
                    {
                        model: DETALLE_HORARIOS,
                        as: 'detalleHorario',
                        attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado']
                    },
                    {
                        model: STANDS,
                        as: 'stand',
                        attributes: ['idStand', 'nombreStand']
                    }
                ]
            });
            return res.status(200).json(asignaciones);
        } catch (error) {
            console.error('Error al listar las asignaciones activas:', error);
            return res.status(500).json({
                message: 'Error al listar las asignaciones activas.'
            });
        }
    },

    // Obtener asignaciones inactivas
    async findInactive(req, res) {
        try {
            const asignaciones = await ASIGNACION_STANDS.findAll({
                where: { estado: 0 },
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    },
                    {
                        model: DETALLE_HORARIOS,
                        as: 'detalleHorario',
                        attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado']
                    },
                    {
                        model: STANDS,
                        as: 'stand',
                        attributes: ['idStand', 'nombreStand']
                    }
                ]
            });
            return res.status(200).json(asignaciones);
        } catch (error) {
            console.error('Error al listar las asignaciones inactivas:', error);
            return res.status(500).json({
                message: 'Error al listar las asignaciones inactivas.'
            });
        }
    },

    // Obtener una asignación por ID
    async findById(req, res) {
        const id = req.params.id;
        try {
            const asignacion = await ASIGNACION_STANDS.findByPk(id, {
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    },
                    {
                        model: DETALLE_HORARIOS,
                        as: 'detalleHorario',
                        attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado']
                    },
                    {
                        model: STANDS,
                        as: 'stand',
                        attributes: ['idStand', 'nombreStand', 'direccion']
                    }
                ]
            });

            if (!asignacion) {
                return res.status(404).json({ message: 'Asignación no encontrada' });
            }

            return res.status(200).json(asignacion);
        } catch (error) {
            console.error(`Error al buscar la asignación con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar la asignación.'
            });
        }
    },

    // Crear una nueva asignación
    async create(req, res) {
        const { idInscripcionEvento, idStand, idDetalleHorario } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1;
        
        if (!idInscripcionEvento || !idStand || !idDetalleHorario) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            const nuevaAsignacion = await ASIGNACION_STANDS.create({
                estado,
                idInscripcionEvento,
                idStand,
                idDetalleHorario
            });

            return res.status(201).json({
                message: 'Asignación creada con éxito',
                createdAsignacion: nuevaAsignacion
            });
        } catch (error) {
            console.error('Error al crear la asignación:', error);
            return res.status(500).json({ message: 'Error al crear la asignación.' });
        }
    },

    // Actualizar una asignación existente
    async update(req, res) {
        const { estado, idInscripcionEvento, idStand, idDetalleHorario } = req.body;
        const id = req.params.id;

        const camposActualizados = {};
        if (estado !== undefined) camposActualizados.estado = estado;
        if (idInscripcionEvento !== undefined) camposActualizados.idInscripcionEvento = idInscripcionEvento;
        if (idStand !== undefined) camposActualizados.idStand = idStand;
        if (idDetalleHorario !== undefined) camposActualizados.idDetalleHorario = idDetalleHorario;

        try {
            const [rowsUpdated] = await ASIGNACION_STANDS.update(camposActualizados, {
                where: { idAsignacionStands: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Asignación no encontrada' });
            }

            const asignacionActualizada = await ASIGNACION_STANDS.findByPk(id, {
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    },
                    {
                        model: DETALLE_HORARIOS,
                        as: 'detalleHorario',
                        attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado']
                    },
                    {
                        model: STANDS,
                        as: 'stand',
                        attributes: ['idStand', 'nombreStand', 'direccion']
                    }
                ]
            });

            return res.status(200).json({
                message: `La asignación con ID: ${id} ha sido actualizada`,
                updatedAsignacion: asignacionActualizada
            });
        } catch (error) {
            console.error(`Error al actualizar la asignación con ID ${id}:`, error);
            return res.status(500).json({ message: 'Error al actualizar la asignación.' });
        }
    },

    // Eliminar una asignación
    async delete(req, res) {
        const id = req.params.id;

        try {
            const asignacion = await ASIGNACION_STANDS.findByPk(id);

            if (!asignacion) {
                return res.status(404).json({ message: 'Asignación no encontrada' });
            }

            await asignacion.destroy();
            return res.status(200).json({ message: 'Asignación eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar la asignación:', error);
            return res.status(500).json({ message: 'Error al eliminar la asignación.' });
        }
    }
};