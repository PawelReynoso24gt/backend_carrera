'use strict';

const db = require('../models');
const { format } = require('date-fns'); // Asegúrate de importar 'format'
const SITUACIONES = db.situaciones;
const TIPO_SITUACIONES = db.tipo_situaciones;
const USUARIOS = db.usuarios;

module.exports = {
    // Obtener todas las situaciones
    async findAll(req, res) {
        try {
            const situaciones = await SITUACIONES.findAll({
                include: [
                    {
                        model: db.tipo_situaciones,
                        attributes: ['idTipoSituacion', 'tipoSituacion'],
                        as: 'tipo_situacione',
                    },
                    {
                        model: db.usuarios,
                        attributes: ['idUsuario', 'usuario', 'idPersona'],
                        as: 'usuario',
                        include: [
                            {
                                model: db.personas,
                                attributes: ['idPersona', 'nombre'],
                                as: 'persona',
                            },
                        ],
                    },
                ],
            });

            // Formatear la fecha antes de enviar la respuesta
            const situacionesFormateadas = situaciones.map((situacion) => {
                const situacionJSON = situacion.toJSON();
                situacionJSON.fechaOcurrencia = format(new Date(situacion.fechaOcurrencia), 'yyyy-MM-dd HH:mm:ss');
                return situacionJSON;
            });

            return res.status(200).json(situacionesFormateadas);
        } catch (error) {
            console.error('Error al recuperar las situaciones:', error);
            return res.status(500).json({ message: 'Ocurrió un error al recuperar las situaciones.' });
        }
    },

    // Obtener una situación por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const situacion = await SITUACIONES.findByPk(id, {
                include: [
                    {
                        model: TIPO_SITUACIONES,
                        attributes: ['idTipoSituacion', 'tipoSituacion']
                    },
                    {
                        model: USUARIOS,
                        attributes: ['idUsuario', 'usuario', 'idPersona'],
                        include: [{
                            model: db.personas,
                            attributes: ['idPersona', 'nombre']
                        }]
                    }
                ]
            });

            if (!situacion) {
                return res.status(404).json({ message: 'Situación no encontrada.' });
            }

            return res.status(200).json(situacion);
        } catch (error) {
            console.error('Error al recuperar la situación:', error);
            return res.status(500).json({ message: 'Ocurrió un error al recuperar la situación.' });
        }
    },

    // Obtener situaciones con estado: Reportado
    async findReportadas(req, res) {
        try {
            const situaciones = await SITUACIONES.findAll({
                where: { estado: 'Reportado' },
            });
            return res.status(200).json(situaciones);
        } catch (error) {
            console.error('Error al recuperar situaciones reportadas:', error);
            return res.status(500).json({ message: 'Error al recuperar situaciones reportadas.' });
        }
    },

    // Obtener situaciones con estado: En Revisión
    async findEnRevision(req, res) {
        try {
            const situaciones = await SITUACIONES.findAll({
                where: { estado: 'En Revisión' },
            });
            return res.status(200).json(situaciones);
        } catch (error) {
            console.error('Error al recuperar situaciones en revisión:', error);
            return res.status(500).json({ message: 'Error al recuperar situaciones en revisión.' });
        }
    },

    // Obtener situaciones con estado: En Proceso
    async findEnProceso(req, res) {
        try {
            const situaciones = await SITUACIONES.findAll({
                where: { estado: 'En Proceso' },
            });
            return res.status(200).json(situaciones);
        } catch (error) {
            console.error('Error al recuperar situaciones en proceso:', error);
            return res.status(500).json({ message: 'Error al recuperar situaciones en proceso.' });
        }
    },

    // Obtener situaciones con estado: Próximo a Solucionarse
    async findProximoASolucionarse(req, res) {
        try {
            const situaciones = await SITUACIONES.findAll({
                where: { estado: 'Próximo a Solucionarse' },
            });
            return res.status(200).json(situaciones);
        } catch (error) {
            console.error('Error al recuperar situaciones próximo a solucionarse:', error);
            return res.status(500).json({ message: 'Error al recuperar situaciones próximo a solucionarse.' });
        }
    },

    // Obtener situaciones con estado: En Reparación
    async findEnReparacion(req, res) {
        try {
            const situaciones = await SITUACIONES.findAll({
                where: { estado: 'En Reparación' },
            });
            return res.status(200).json(situaciones);
        } catch (error) {
            console.error('Error al recuperar situaciones en reparación:', error);
            return res.status(500).json({ message: 'Error al recuperar situaciones en reparación.' });
        }
    },

    // Obtener situaciones con estado: Resuelta
    async findResueltas(req, res) {
        try {
            const situaciones = await SITUACIONES.findAll({
                where: { estado: 'Resuelta' },
            });
            return res.status(200).json(situaciones);
        } catch (error) {
            console.error('Error al recuperar situaciones resueltas:', error);
            return res.status(500).json({ message: 'Error al recuperar situaciones resueltas.' });
        }
    },

    // Obtener situaciones con estado: Sin Solución
    async findSinSolucion(req, res) {
        try {
            const situaciones = await SITUACIONES.findAll({
                where: { estado: 'Sin Solución' },
            });
            return res.status(200).json(situaciones);
        } catch (error) {
            console.error('Error al recuperar situaciones sin solución:', error);
            return res.status(500).json({ message: 'Error al recuperar situaciones sin solución.' });
        }
    },

    // Crear una nueva situación
    async create(req, res) {
        const { fechaOcurrencia, descripcion, idTipoSituacion, idUsuario } = req.body;

        // Validar campos obligatorios
        if (!descripcion || !idTipoSituacion || !idUsuario) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        const nuevaSituacion = {
            fechaOcurrencia: fechaOcurrencia || new Date(),
            descripcion,
            idTipoSituacion,
            idUsuario,
            respuesta: "Sin respuesta...",
            estado: "Reportada", // Estado por defecto
            observaciones: "Sin observaciones" // Observaciones por defecto
        };

        try {
            const situacionCreada = await SITUACIONES.create(nuevaSituacion);
            return res.status(201).json({
                message: 'Situación creada exitosamente.',
                situacion: situacionCreada
            });
        } catch (error) {
            console.error('Error al crear la situación:', error);
            return res.status(500).json({ message: 'Ocurrió un error al crear la situación.' });
        }
    },

    // Actualizar una situación (Reporte)
    async updateReporte(req, res) {
        const id = req.params.id;
        const { fechaOcurrencia, descripcion, idTipoSituacion, idUsuario } = req.body;

        const camposActualizados = {};

        if (fechaOcurrencia !== undefined) camposActualizados.fechaOcurrencia = fechaOcurrencia;
        if (descripcion !== undefined) camposActualizados.descripcion = descripcion;
        if (idTipoSituacion !== undefined) camposActualizados.idTipoSituacion = idTipoSituacion;
        if (idUsuario !== undefined) camposActualizados.idUsuario = idUsuario;

        // Verificar si se enviaron campos para actualizar
        if (Object.keys(camposActualizados).length === 0) {
            return res.status(400).json({ message: 'No se enviaron campos para actualizar.' });
        }

        try {
            const [rowsUpdated] = await SITUACIONES.update(camposActualizados, {
                where: { idSituacion: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Situación no encontrada.' });
            }

            const situacionActualizada = await SITUACIONES.findByPk(id);
            return res.status(200).json({
                message: 'Reporte actualizado exitosamente.',
                situacion: situacionActualizada
            });
        } catch (error) {
            console.error('Error al actualizar el reporte:', error);
            return res.status(500).json({ message: 'Ocurrió un error al actualizar el reporte.' });
        }
    },

    // Actualizar una situación (Respuesta)
    async updateRespuesta(req, res) {
        const id = req.params.id;
        const { respuesta, estado, observaciones } = req.body;

        const estadosPermitidos = [
            'En Revisión',
            'En Proceso',
            'Próximo a Solucionarse',
            'En Reparación',
            'Resuelta',
            'Sin Solución'
        ];

        const camposActualizados = {};

        if (respuesta !== undefined) camposActualizados.respuesta = respuesta;

        if (estado !== undefined) {
            // Validar el estado
            if (!estadosPermitidos.includes(estado)) {
                return res.status(400).json({
                    message: `El estado proporcionado no es válido. Los estados permitidos son: ${estadosPermitidos.join(', ')}.`
                });
            }
            camposActualizados.estado = estado;
        }

        if (observaciones !== undefined) {
            camposActualizados.observaciones = observaciones || 'Sin observaciones';
        }

        // Verificar si se enviaron campos para actualizar
        if (Object.keys(camposActualizados).length === 0) {
            return res.status(400).json({ message: 'No se enviaron campos para actualizar.' });
        }

        try {
            const [rowsUpdated] = await SITUACIONES.update(camposActualizados, {
                where: { idSituacion: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Situación no encontrada.' });
            }

            const situacionActualizada = await SITUACIONES.findByPk(id);
            return res.status(200).json({
                message: 'Respuesta actualizada exitosamente.',
                situacion: situacionActualizada
            });
        } catch (error) {
            console.error('Error al actualizar la respuesta:', error);
            return res.status(500).json({ message: 'Ocurrió un error al actualizar la respuesta.' });
        }
    }
};
