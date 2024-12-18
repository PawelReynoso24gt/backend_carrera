'use strict';

const db = require('../models');
const INSCRIPCION_COMISION = db.inscripcion_comisiones;

module.exports = {

    // Obtener todas las inscripciones
    async find(req, res) {
        try {
            const inscripciones = await INSCRIPCION_COMISION.findAll({
                include: [
                    {
                        model: db.comisiones,
                        attributes: ['idComision', 'comision', 'descripcion']
                    },
                    {
                        model: db.voluntarios,
                        attributes: ['idVoluntario']
                    }
                ]
            });
            return res.status(200).json(inscripciones);
        } catch (error) {
            console.error('Error al recuperar las inscripciones:', error);
            return res.status(500).json({ message: 'Error al recuperar las inscripciones.' });
        }
    },

    // Obtener inscripciones activas
    async findActive(req, res) {
        try {
            const inscripciones = await INSCRIPCION_COMISION.findAll({
                where: { estado: 1 },
                include: [
                    {
                        model: db.comisiones,
                        attributes: ['idComision', 'comision']
                    },
                    {
                        model: db.voluntarios,
                        attributes: ['idVoluntario']
                    }
                ]
            });
            return res.status(200).json(inscripciones);
        } catch (error) {
            console.error('Error al recuperar inscripciones activas:', error);
            return res.status(500).json({ message: 'Error al recuperar inscripciones activas.' });
        }
    },

    // Obtener inscripciones inactivas
    async findInactive(req, res) {
        try {
            const inscripciones = await INSCRIPCION_COMISION.findAll({
                where: { estado: 0 },
                include: [
                    {
                        model: db.comisiones,
                        attributes: ['idComision', 'comision']
                    },
                    {
                        model: db.voluntarios,
                        attributes: ['idVoluntario']
                    }
                ]
            });
            return res.status(200).json(inscripciones);
        } catch (error) {
            console.error('Error al recuperar inscripciones inactivas:', error);
            return res.status(500).json({ message: 'Error al recuperar inscripciones inactivas.' });
        }
    },

    // Obtener inscripción por ID
    async findById(req, res) {
        const { id } = req.params;
        try {
            const inscripcion = await INSCRIPCION_COMISION.findByPk(id, {
                include: [
                    { model: db.comisiones, attributes: ['idComision', 'comision'] },
                    { model: db.voluntarios, attributes: ['idVoluntario'] }
                ]
            });
            if (!inscripcion) {
                return res.status(404).json({ message: 'Inscripción no encontrada.' });
            }
            return res.status(200).json(inscripcion);
        } catch (error) {
            console.error('Error al recuperar inscripción:', error);
            return res.status(500).json({ message: 'Error al recuperar inscripción.' });
        }
    },

    // Crear una nueva inscripción
    async create(req, res) {
        const { idComision, idVoluntario, estado } = req.body;

        if (!idComision || !idVoluntario) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            const nuevaInscripcion = await INSCRIPCION_COMISION.create({
                idComision,
                idVoluntario,
                estado: estado !== undefined ? estado : 1 // Valor por defecto: activo
            });

            return res.status(201).json({
                message: 'Inscripción creada exitosamente.',
                nuevaInscripcion
            });
        } catch (error) {
            console.error('Error al crear inscripción:', error);
            return res.status(500).json({ message: 'Error al crear inscripción.' });
        }
    },

    // Actualizar una inscripción existente
    async update(req, res) {
        const { id } = req.params;
        const { idComision, idVoluntario, estado } = req.body;

        const camposActualizados = {}; // Objeto para almacenar solo los campos enviados

        // Validación dinámica: Solo agregar los campos enviados en el request body
        if (idComision !== undefined) {
            camposActualizados.idComision = idComision;
        }

        if (idVoluntario !== undefined) {
            camposActualizados.idVoluntario = idVoluntario;
        }

        if (estado !== undefined) {
            if (![0, 1].includes(estado)) {
                return res.status(400).json({ message: 'El estado debe ser 0 (inactivo) o 1 (activo).' });
            }
            camposActualizados.estado = estado;
        }

        // Si no se envió ningún campo, devolver un error
        if (Object.keys(camposActualizados).length === 0) {
            return res.status(400).json({ message: 'No se enviaron campos para actualizar.' });
        }

        try {
            // Realizar la actualización con solo los campos enviados
            const [updatedRows] = await INSCRIPCION_COMISION.update(
                camposActualizados,
                { where: { idInscripcionComision: id } }
            );

            if (updatedRows === 0) {
                return res.status(404).json({ message: 'Inscripción no encontrada.' });
            }

            // Obtener la inscripción actualizada para devolverla en la respuesta
            const inscripcionActualizada = await INSCRIPCION_COMISION.findByPk(id);
            return res.status(200).json({
                message: 'Inscripción actualizada exitosamente.',
                inscripcionActualizada
            });
        } catch (error) {
            console.error('Error al actualizar inscripción:', error);
            return res.status(500).json({ message: 'Error al actualizar inscripción.' });
        }
    },


    // Eliminar una inscripción
    async delete(req, res) {
        const { id } = req.params;

        try {
            const inscripcion = await INSCRIPCION_COMISION.findByPk(id);
            if (!inscripcion) {
                return res.status(404).json({ message: 'Inscripción no encontrada.' });
            }

            await inscripcion.destroy();
            return res.status(200).json({ message: 'Inscripción eliminada correctamente.' });
        } catch (error) {
            console.error('Error al eliminar inscripción:', error);
            return res.status(500).json({ message: 'Error al eliminar inscripción.' });
        }
    }
};
