'use strict';
const db = require('../models');
const TIPO_SITUACIONES = db.tipo_situaciones;

module.exports = {
  // Obtener todos
    async findAll(req, res) {
        try {
                const tipoSituaciones = await TIPO_SITUACIONES.findAll({
                    where: { estado: 1 },
                });
            return res.status(200).json(tipoSituaciones);
            } catch (error) {
            console.error('Error al recuperar los tipos:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.',
            });
        }
    },

    // Obtener activas
    async findActive(req, res) {
    try {
            const tipoSituaciones = await TIPO_SITUACIONES.findAll({
                where: { estado: 1 },
            });
            return res.status(200).json(tipoSituaciones);
        } catch (error) {
            console.error('Error al recuperar los tipos:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.',
            });
        }
    },

      // Obtener activas
    async findInactive(req, res) {
        try {
            const tipoSituaciones = await TIPO_SITUACIONES.findAll({
                where: { estado: 0 },
            });
            return res.status(200).json(tipoSituaciones);
        } catch (error) {
            console.error('Error al recuperar los tipos:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.',
            });
        }
    },

    // Obtener una bitácora por ID
    async findById(req, res) {
    const id = req.params.id;

    try {
        const tipoSituaciones = await TIPO_SITUACIONES.findByPk(id);

        if (!tipoSituaciones) {
        return res.status(404).json({ message: 'Tipo de situación no encontrada' });
        }

        return res.status(200).json(tipoSituaciones);
    } catch (error) {
        console.error(`Error al buscar el tipo de situación con ID ${id}:`, error);
        return res.status(500).json({ error: 'Error al buscar el tipo de situación' });
    }
    },

    // Crear un nuevo tipo de situación
    async create(req, res) {
        const { tipoSituacion, estado } = req.body;

        // Validar los datos de entrada
        if (!tipoSituacion || typeof tipoSituacion !== 'string') {
            return res.status(400).json({ message: 'El campo "tipoSituacion" es obligatorio y debe ser un texto válido.' });
        }

        const nuevoTipoSituacion = {
            tipoSituacion,
            estado: estado !== undefined ? estado : 1 // Estado por defecto: 1 (activo)
        };

        try {
            const tipoSituacionCreada = await TIPO_SITUACIONES.create(nuevoTipoSituacion);
            return res.status(201).json({
                message: 'Tipo de situación creada exitosamente.',
                tipoSituacion: tipoSituacionCreada
            });
        } catch (error) {
            console.error('Error al crear el tipo de situación:', error);
            return res.status(500).json({ message: 'Ocurrió un error al crear el tipo de situación.' });
        }
    },

 // Actualizar un tipo de situación existente
    async update(req, res) {
        const id = req.params.id; // ID del tipo de situación a actualizar
        const { tipoSituacion, estado } = req.body;

        // Validar que se proporcionen datos para actualizar
        if (!tipoSituacion && estado === undefined) {
            return res.status(400).json({ message: 'Debe proporcionar al menos un campo para actualizar.' });
        }

        const camposActualizados = {};

        // Actualizar solo los campos enviados
        if (tipoSituacion !== undefined) camposActualizados.tipoSituacion = tipoSituacion;
        if (estado !== undefined) camposActualizados.estado = estado;

        try {
            const [rowsUpdated] = await TIPO_SITUACIONES.update(camposActualizados, {
                where: { idTipoSituacion: id }
            });

            // Validar si se encontró y actualizó el registro
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Tipo de situación no encontrado.' });
            }

            // Recuperar el registro actualizado
            const tipoSituacionActualizada = await TIPO_SITUACIONES.findByPk(id);

            return res.status(200).json({
                message: 'Tipo de situación actualizada exitosamente.',
                tipoSituacion: tipoSituacionActualizada
            });
        } catch (error) {
            console.error('Error al actualizar el tipo de situación:', error);
            return res.status(500).json({ message: 'Ocurrió un error al actualizar el tipo de situación.' });
        }
    },

    // Eliminar un tipo de situación
    async delete(req, res) {
        const id = req.params.id; // ID del tipo de situación a eliminar

        try {
            // Buscar el registro a eliminar
            const tipoSituacion = await TIPO_SITUACIONES.findByPk(id);

            if (!tipoSituacion) {
                return res.status(404).json({ message: 'Tipo de situación no encontrado.' });
            }

            // Eliminar el registro
            await tipoSituacion.destroy();

            return res.status(200).json({ message: 'Tipo de situación eliminado correctamente.' });
        } catch (error) {
            console.error('Error al eliminar el tipo de situación:', error);
            return res.status(500).json({ message: 'Ocurrió un error al eliminar el tipo de situación.' });
        }
    },
};
