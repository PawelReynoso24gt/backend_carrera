'use strict';
const db = require('../models');
const DETALLE_INSCRIPCION_ACTIVIDADES = db.detalle_inscripcion_actividades;
const INSCRIPCION_EVENTOS = db.inscripcion_eventos;
const COMISIONES = db.comisiones;
const ACTIVIDADES = db.actividades;

module.exports = {
    // Obtener todos los detalles de inscripción de actividades
    async find(req, res) {
        try {
            const detalles = await DETALLE_INSCRIPCION_ACTIVIDADES.findAll({
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    },
                    {
                        model: COMISIONES,
                        as: 'comision',
                        attributes: ['idComision', 'comision', 'descripcion', 'estado']
                    },
                    {
                        model: ACTIVIDADES,
                        as: 'actividad',
                        attributes: ['idActividad', 'actividad', 'descripcion', 'estado']
                    }
                ],
                where: { estado: 1 } // Solo activos por defecto
            });
            return res.status(200).json(detalles);
        } catch (error) {
            console.error('Error al recuperar los detalles de inscripción de actividades:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los detalles.'
            });
        }
    },

    // Obtener detalles activos
    async findActive(req, res) {
        try {
            const detalles = await DETALLE_INSCRIPCION_ACTIVIDADES.findAll({
                where: { estado: 1 },
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    },
                    {
                        model: COMISIONES,
                        as: 'comision',
                        attributes: ['idComision', 'comision', 'descripcion', 'estado']
                    },
                    {
                        model: ACTIVIDADES,
                        as: 'actividad',
                        attributes: ['idActividad', 'actividad', 'descripcion', 'estado']
                    }
                ]
            });
            return res.status(200).json(detalles);
        } catch (error) {
            console.error('Error al listar los detalles activos:', error);
            return res.status(500).json({
                message: 'Error al listar los detalles activos.'
            });
        }
    },

    // Obtener detalles inactivos
    async findInactive(req, res) {
        try {
            const detalles = await DETALLE_INSCRIPCION_ACTIVIDADES.findAll({
                where: { estado: 0 },
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    },
                    {
                        model: COMISIONES,
                        as: 'comision',
                        attributes: ['idComision', 'comision', 'descripcion', 'estado']
                    },
                    {
                        model: ACTIVIDADES,
                        as: 'actividad',
                        attributes: ['idActividad', 'actividad', 'descripcion', 'estado']
                    }
                ]
            });
            return res.status(200).json(detalles);
        } catch (error) {
            console.error('Error al listar los detalles inactivos:', error);
            return res.status(500).json({
                message: 'Error al listar los detalles inactivos.'
            });
        }
    },

    // Obtener un detalle por ID
    async findById(req, res) {
        const id = req.params.id;
        try {
            const detalle = await DETALLE_INSCRIPCION_ACTIVIDADES.findByPk(id, {
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    },
                    {
                        model: COMISIONES,
                        as: 'comision',
                        attributes: ['idComision', 'comision', 'descripcion', 'estado']
                    },
                    {
                        model: ACTIVIDADES,
                        as: 'actividad',
                        attributes: ['idActividad', 'actividad', 'descripcion', 'estado']
                    }
                ]
            });

            if (!detalle) {
                return res.status(404).json({ message: 'Detalle no encontrado' });
            }

            return res.status(200).json(detalle);
        } catch (error) {
            console.error(`Error al buscar el detalle con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar el detalle.'
            });
        }
    },

    // Crear un nuevo detalle
    async create(req, res) {
        const { idInscripcionEvento, idComision, idActividad } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1;
        
        if (!idInscripcionEvento || !idComision || !idActividad) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            const nuevoDetalle = await DETALLE_INSCRIPCION_ACTIVIDADES.create({
                estado,
                idInscripcionEvento,
                idComision,
                idActividad
            });

            return res.status(201).json({
                message: 'Detalle creado con éxito',
                createdDetalle: nuevoDetalle
            });
        } catch (error) {
            console.error('Error al crear el detalle:', error);
            return res.status(500).json({ message: 'Error al crear el detalle.' });
        }
    },

    // Actualizar un detalle existente
    async update(req, res) {
        const { estado, idInscripcionEvento, idComision, idActividad } = req.body;
        const id = req.params.id;

        const camposActualizados = {};
        if (estado !== undefined) camposActualizados.estado = estado;
        if (idInscripcionEvento !== undefined) camposActualizados.idInscripcionEvento = idInscripcionEvento;
        if (idComision !== undefined) camposActualizados.idComision = idComision;
        if (idActividad !== undefined) camposActualizados.idActividad = idActividad;

        try {
            const [rowsUpdated] = await DETALLE_INSCRIPCION_ACTIVIDADES.update(camposActualizados, {
                where: { idDetalleInscripcionActividad: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Detalle no encontrado' });
            }

            const detalleActualizado = await DETALLE_INSCRIPCION_ACTIVIDADES.findByPk(id, {
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    },
                    {
                        model: COMISIONES,
                        as: 'comision',
                        attributes: ['idComision', 'comision', 'descripcion', 'estado']
                    },
                    {
                        model: ACTIVIDADES,
                        as: 'actividad',
                        attributes: ['idActividad', 'actividad', 'descripcion', 'estado']
                    }
                ]
            });

            return res.status(200).json({
                message: `El detalle con ID: ${id} ha sido actualizado`,
                updatedDetalle: detalleActualizado
            });
        } catch (error) {
            console.error(`Error al actualizar el detalle con ID ${id}:`, error);
            return res.status(500).json({ message: 'Error al actualizar el detalle.' });
        }
    },

    // Eliminar un detalle
    async delete(req, res) {
        const id = req.params.id;

        try {
            const detalle = await DETALLE_INSCRIPCION_ACTIVIDADES.findByPk(id);

            if (!detalle) {
                return res.status(404).json({ message: 'Detalle no encontrado' });
            }

            await detalle.destroy();
            return res.status(200).json({ message: 'Detalle eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar el detalle:', error);
            return res.status(500).json({ message: 'Error al eliminar el detalle.' });
        }
    }
};
