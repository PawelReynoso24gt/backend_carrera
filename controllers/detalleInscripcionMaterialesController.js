'use strict';
const db = require('../models');
const DETALLE_INSCRIPCION_MATERIALES = db.detalle_inscripcion_materiales;
const DETALLE_INSCRIPCION_ACTIVIDADES = db.detalle_inscripcion_actividades;
const INSCRIPCION_EVENTOS = db.inscripcion_eventos;
const INSCRIPCION_COMISIONES = db.inscripcion_comisiones;
const COMISIONES = db.comisiones;
const MATERIALES = db.materiales;
const ACTIVIDADES = db.actividades;

module.exports = {
    // Obtener todos los detalles de inscripción de materiales
    async find(req, res) {
        try {
            const detalles = await DETALLE_INSCRIPCION_MATERIALES.findAll({
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'idEvento', 'estado'],
                        include: [
                            {
                                model: db.eventos,
                                as: 'evento',
                                attributes: ['nombreEvento'], // Incluir el nombre del evento
                            },
                            {
                                model: db.voluntarios,
                                as: 'voluntario',
                                attributes: ['idVoluntario'],
                                include: [
                                    {
                                        model: db.personas,
                                        attributes: ['nombre'], // Incluir el nombre del evento
                                    }
                                ]
                            },
                        ],
                    },
                    {
                        model: INSCRIPCION_COMISIONES,
                        as: 'inscripcion_comisione', // Alias correcto
                        attributes: ['idInscripcionComision', 'idComision', 'idVoluntario', 'estado'],
                        include: [
                            {
                                model: db.comisiones,
                                as: 'comisione', // Alias correcto
                                attributes: ['idComision', 'comision'],
                            },
                        ],
                    },
                    {
                        model: MATERIALES,
                        as: 'material'},

                ],
                where: { estado: 1 } // Solo mostrar las inscripciones activas
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

    async findByComision(req, res) {
        const { idComision } = req.params;

        try {
            // Verificar si el parámetro idComision existe
            if (!idComision) {
                return res.status(400).json({ message: 'Se requiere el ID de la comisión.' });
            }

            // Buscar inscripción de la comisión
            const inscripcion = await INSCRIPCION_COMISIONES.findOne({
                where: { idComision },
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado']
                    }
                ]
            });

            if (!inscripcion) {
                return res.status(404).json({ message: 'No se encontró inscripción para la comisión.' });
            }

            return res.status(200).json(inscripcion);
        } catch (error) {
            console.error('Error al buscar inscripción por comisión:', error);
            return res.status(500).json({ message: 'Error al buscar inscripción por comisión.' });
        }
    },



    // Obtener un detalle por ID
    async findById(req, res) {
        try {
            const detalles = await DETALLE_INSCRIPCION_MATERIALES.findAll({
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'idEvento'],
                        include: [
                            {
                                model: db.eventos,
                                as: 'evento',
                                attributes: ['idEvento', 'nombreEvento'],
                            },
                        ],
                    },
                    {
                        model: INSCRIPCION_COMISIONES,
                        as: 'inscripcion_comisione', // Alias correcto
                        attributes: ['idInscripcionComision', 'idComision'],
                        include: [
                            {
                                model: db.comisiones,
                                as: 'comisione', // Alias correcto
                                attributes: ['idComision', 'comision'],
                            },
                        ],
                    },
                    {
                        model: MATERIALES,
                        as: 'material',
                        attributes: ['idMaterial', 'material'], // Cambiar 'nombre' a 'material'
                    },
                ],
                where: { idDetalleInscripcionMaterial: req.params.id }, // Filtrar por ID
            });
            return res.status(200).json(detalles);
        } catch (error) {
            console.error('Error al obtener los detalles:', error);
            return res.status(500).json({ message: 'Error al obtener los detalles.' });
        }
    },



    // Crear un nuevo detalle
    async create(req, res) {
        const { idInscripcionEvento, cantidadMaterial, idInscripcionComision, idMaterial } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1;

        if (!idInscripcionEvento || !cantidadMaterial || !idInscripcionComision || !idMaterial) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            // Validar si el evento existe
            const eventoExistente = await INSCRIPCION_EVENTOS.findByPk(idInscripcionEvento);
            if (!eventoExistente) {
                return res.status(400).json({ message: 'El idInscripcionEvento no existe.' });
            }

            const nuevoDetalle = await DETALLE_INSCRIPCION_MATERIALES.create({
                estado,
                cantidadMaterial,
                idInscripcionEvento,
                idInscripcionComision,
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
