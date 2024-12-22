'use strict';
const db = require('../models');
const DETALLE_INSCRIPCION_MATERIALES = db.detalle_inscripcion_materiales;
const INSCRIPCION_EVENTOS = db.inscripcion_eventos;
const INSCRIPCION_COMISIONES = db.inscripcion_comisiones;
const COMISIONES = db.comisiones;
const MATERIALES = db.materiales;

module.exports = {
    // Obtener todos los detalles de inscripción de materiales
    async find(req, res) {
        try {
            const detalles = await DETALLE_INSCRIPCION_MATERIALES.findAll({
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    },
                    {
                        model: INSCRIPCION_COMISIONES,
                        attributes: ['idInscripcionComision', 'idComision', 'idVoluntario', 'estado']
                    },
                    {
                        model: MATERIALES,
                        as: 'material',
                        attributes: ['idMaterial', 'material', 'cantidad', 'descripcion', 'estado']
                    }
                ],
                where: { estado: 1 } // Solo activos por defecto
            });
            return res.status(200).json(detalles);
        } catch (error) {
            console.error('Error al recuperar los detalles de inscripción de materiales:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los detalles.'
            });
        }
    },

    // Obtener detalles activos
    async findActive(req, res) {
        try {
            const detalles = await DETALLE_INSCRIPCION_MATERIALES.findAll({
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
                        model: MATERIALES,
                        as: 'material',
                        attributes: ['idMaterial', 'material', 'cantidad', 'descripcion', 'estado']
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
            const detalles = await DETALLE_INSCRIPCION_MATERIALES.findAll({
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
                        model: MATERIALES,
                        as: 'material',
                        attributes: ['idMaterial', 'material', 'cantidad', 'descripcion', 'estado']
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
            const detalle = await DETALLE_INSCRIPCION_MATERIALES.findByPk(id, {
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
                        model: MATERIALES,
                        as: 'material',
                        attributes: ['idMaterial', 'material', 'cantidad', 'descripcion', 'estado']
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
        const { idInscripcionEvento, cantidadMaterial, idComision, idMaterial } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1;
        if (!idInscripcionEvento || !cantidadMaterial || !idComision || !idMaterial) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            const nuevoDetalle = await DETALLE_INSCRIPCION_MATERIALES.create({
                estado,
                cantidadMaterial,
                idInscripcionEvento,
                idComision,
                idMaterial
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
        const { estado, idInscripcionEvento, cantidadMaterial, idComision, idMaterial } = req.body;
        const id = req.params.id;

        const camposActualizados = {};
        if (estado !== undefined) camposActualizados.estado = estado;
        if (idInscripcionEvento !== undefined) camposActualizados.idInscripcionEvento = idInscripcionEvento;
        if (cantidadMaterial !== undefined) camposActualizados.cantidadMaterial = cantidadMaterial;
        if (idComision !== undefined) camposActualizados.idComision = idComision;
        if (idMaterial !== undefined) camposActualizados.idMaterial = idMaterial;

        try {
            const [rowsUpdated] = await DETALLE_INSCRIPCION_MATERIALES.update(camposActualizados, {
                where: { idDetalleInscripcionMaterial: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Detalle no encontrado' });
            }

            const detalleActualizado = await DETALLE_INSCRIPCION_MATERIALES.findByPk(id, {
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
                        model: MATERIALES,
                        as: 'material',
                        attributes: ['idMaterial', 'material', 'cantidad', 'descripcion', 'estado']
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
            const detalle = await DETALLE_INSCRIPCION_MATERIALES.findByPk(id);

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
