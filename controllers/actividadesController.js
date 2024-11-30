'use strict';
const db = require("../models");
const ACTIVIDADES = db.actividades;
const COMISIONES = db.comisiones;

module.exports = {
    // Obtener todas las actividades
    async find(req, res) {
        try {
            const actividades = await ACTIVIDADES.findAll({
                include: {
                    model: COMISIONES,
                    as: 'comision',
                    attributes: ['idComision', 'comision', 'descripcion', 'estado']
                },
                where: {
                    estado: 1
                }
            });
            return res.status(200).json(actividades);
        } catch (error) {
            console.error('Error al recuperar las actividades:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // Obtener todas las actividades activas
    async findActive(req, res) {
        try {
            const actividades = await ACTIVIDADES.findAll({
                where: { estado: 1 },
                include: {
                    model: COMISIONES,
                    as: 'comision',
                    attributes: ['idComision', 'comision', 'descripcion', 'estado']
                }
            });
            return res.status(200).json(actividades);
        } catch (error) {
            console.error('Error al listar las actividades activas:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar las actividades activas.'
            });
        }
    },

    // Obtener todas las actividades inactivas
    async findInactive(req, res) {
        try {
            const actividades = await ACTIVIDADES.findAll({
                where: { estado: 0 },
                include: {
                    model: COMISIONES,
                    as: 'comision',
                    attributes: ['idComision', 'comision', 'descripcion', 'estado']
                }
            });
            return res.status(200).json(actividades);
        } catch (error) {
            console.error('Error al listar las actividades inactivas:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar las actividades inactivas.'
            });
        }
    },

    // Obtener actividad por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const actividad = await ACTIVIDADES.findByPk(id, {
                include: {
                    model: COMISIONES,
                    as: 'comision',
                    attributes: ['idComision', 'comision', 'descripcion', 'estado']
                }
            });

            if (!actividad) {
                return res.status(404).json({ message: 'Actividad no encontrada' });
            }

            return res.status(200).json(actividad);
        } catch (error) {
            console.error(`Error al buscar actividad con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar la actividad.'
            });
        }
    },

    // Crear una nueva actividad
    async create(req, res) {
        const { actividad, descripcion, idComision } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1; // Valor predeterminado de estado: 1

        if (!actividad || !descripcion || !idComision) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        // Validación de solo letras y espacios para actividad
        const regexActividad = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
        if (!regexActividad.test(actividad)) {
            return res.status(400).json({ message: 'El nombre de la actividad solo puede contener letras y espacios.' });
        }

        // Validación del estado (si se incluye en el JSON)
        if (![0, 1].includes(estado)) {
            return res.status(400).json({ message: 'El estado debe ser 0 (inactivo) o 1 (activo).' });
        }

        try {
            // Verificar si la comisión existe
            const comisionExistente = await COMISIONES.findByPk(idComision);
            if (!comisionExistente) {
                return res.status(400).json({ message: 'El idComision proporcionado no existe.' });
            }

            const nuevaActividad = {
                actividad,
                descripcion,
                estado, // Usar el valor predeterminado o el proporcionado
                idComision
            };

            const actividadCreada = await ACTIVIDADES.create(nuevaActividad);
            return res.status(201).json({
                message: 'Actividad creada con éxito',
                createdActividad: actividadCreada
            });
        } catch (error) {
            console.error('Error al crear la actividad:', error);
            return res.status(500).json({
                message: error.message || 'Error al crear la actividad.'
            });
        }
    },

    // Actualizar una actividad existente
    async update(req, res) {
        const { actividad, descripcion, estado, idComision } = req.body;
        const id = req.params.id;

        const camposActualizados = {};

        // Validación del nombre de la actividad
        if (actividad !== undefined) {
            const regexActividad = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
            if (!regexActividad.test(actividad)) {
                return res.status(400).json({ message: 'El nombre de la actividad solo puede contener letras y espacios.' });
            }
            camposActualizados.actividad = actividad;
        }

        if (descripcion !== undefined) {
            camposActualizados.descripcion = descripcion;
        }

        if (estado !== undefined) {
            if (![0, 1].includes(estado)) {
                return res.status(400).json({ message: 'El estado debe ser 0 (inactivo) o 1 (activo).' });
            }
            camposActualizados.estado = estado;
        }

        if (idComision !== undefined) {
            // Verificar si la comisión existe
            const comisionExistente = await COMISIONES.findByPk(idComision);
            if (!comisionExistente) {
                return res.status(400).json({ message: 'El idComision proporcionado no existe.' });
            }
            camposActualizados.idComision = idComision;
        }

        try {
            const [rowsUpdated] = await ACTIVIDADES.update(camposActualizados, {
                where: { idActividad: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Actividad no encontrada.' });
            }

            const actividadActualizada = await ACTIVIDADES.findByPk(id, {
                include: {
                    model: COMISIONES,
                    as: 'comision',
                    attributes: ['idComision', 'comision', 'descripcion', 'estado']
                }
            });

            return res.status(200).json({
                message: `La actividad con ID ${id} ha sido actualizada con éxito.`,
                actividad: actividadActualizada
            });
        } catch (error) {
            console.error(`Error al actualizar la actividad con ID ${id}:`, error);
            return res.status(500).json({ message: 'Error al actualizar la actividad.' });
        }
    },

    // Eliminar una actividad
    async delete(req, res) {
        const id = req.params.id;

        try {
            const actividad = await ACTIVIDADES.findByPk(id);

            if (!actividad) {
                return res.status(404).json({ message: 'Actividad no encontrada.' });
            }

            await actividad.destroy();
            return res.status(200).json({ message: 'Actividad eliminada correctamente.' });
        } catch (error) {
            console.error('Error al eliminar la actividad:', error);
            return res.status(500).json({ message: 'Error al eliminar la actividad.' });
        }
    }
};
