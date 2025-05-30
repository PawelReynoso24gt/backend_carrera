'use strict';
const db = require('../models');
const DETALLE_INSCRIPCION_ACTIVIDADES = db.detalle_inscripcion_actividades;
const INSCRIPCION_EVENTOS = db.inscripcion_eventos;
const INSCRIPCION_COMISIONES = db.inscripcion_comisiones;
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
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado'],
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
                        ]
                    },
                    {
                        model: INSCRIPCION_COMISIONES,
                        as: 'inscripcion_comisione',
                        attributes: ['idInscripcionComision', 'idComision', 'estado'],
                        include: [
                            {
                                model: db.comisiones,
                                as: 'comisione',
                                attributes: ['comision'], // Incluir el nombre de la comisión
                            },
                        ],
                    },
                    {
                        model: ACTIVIDADES,
                        as: 'actividad',
                        attributes: ['actividad', 'descripcion', 'estado'], // Datos de la actividad
                    },
                ],
                where: { estado: 1 }, // Solo activos
            });
    
            return res.status(200).json(detalles);
        } catch (error) {
            console.error('Error al recuperar los detalles de inscripción de actividades:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los detalles.',
            });
        }
    },

    async findInscripcionByComisionAndVoluntario(req, res) {
        const { idComision, idVoluntario } = req.params;
    
        try {
          // Buscar inscripción de comisiones vinculada al voluntario y la comisión
          const inscripcion = await INSCRIPCION_COMISIONES.findOne({
            where: {
              idComision,
              idVoluntario,
              estado: 1, // Solo inscripciones activas
            },
            include: [
              {
                model: INSCRIPCION_EVENTOS,
                attributes: ['idInscripcionEvento'], // Solo devolver lo necesario
              },
            ],
          });
    
          // Validar si no se encontró la inscripción
          if (!inscripcion) {
            return res.status(404).json({ message: "No se encontró la inscripción." });
          }
    
          // Responder con los datos necesarios
          return res.status(200).json({
            idInscripcionComision: inscripcion.idInscripcionComision,
            idInscripcionEvento: inscripcion.inscripcion_evento?.idInscripcionEvento || null,
          });
        } catch (error) {
          console.error("Error al buscar inscripciones:", error);
          return res.status(500).json({ message: "Error al buscar inscripciones." });
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
                        model: INSCRIPCION_COMISIONES,
                        attributes: ['idInscripcionComision', 'idComision', 'idVoluntario', 'estado']
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
                        model: INSCRIPCION_COMISIONES,
                        attributes: ['idInscripcionComision', 'idComision', 'idVoluntario', 'estado']
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
                        model: INSCRIPCION_COMISIONES,
                        attributes: ['idInscripcionComision', 'idComision', 'idVoluntario', 'estado']
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

   // Crear un nuevo detalle de inscripción
    async create(req, res) {
        const { idInscripcionEvento, idInscripcionComision, idActividad, estado } = req.body;

        if (!idInscripcionEvento || !idInscripcionComision || !idActividad) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            // Verificar si ya existe un detalle con los mismos IDs
            const existente = await DETALLE_INSCRIPCION_ACTIVIDADES.findOne({
                where: {
                    idInscripcionEvento,
                    idInscripcionComision,
                    idActividad
                }
            });

            if (existente) {
                return res.status(400).json({ message: 'Ya existe un detalle con estos datos.' });
            }

            const nuevoDetalle = await DETALLE_INSCRIPCION_ACTIVIDADES.create({
                estado: estado !== undefined ? estado : 1, // Valor por defecto: activo
                idInscripcionEvento,
                idInscripcionComision,
                idActividad
            });

            return res.status(201).json({
                message: 'Detalle creado con éxito.',
                nuevoDetalle
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
        if (idInscripcionComision !== undefined) camposActualizados.idInscripcionComision = idInscripcionComision;
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
                        model: INSCRIPCION_COMISIONES,
                        attributes: ['idInscripcionComision', 'idComision', 'idVoluntario', 'estado']
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
