'use strict';
const { where } = require("sequelize");
const db = require("../models");
const COMISIONES = db.comisiones;
const INSCRIPCION_COMISION = db.inscripcion_comisiones;

// Métodos CRUD
module.exports = {

    // Obtener todas las comisiones
    async find(req, res) {
        try {
            const comisiones = await COMISIONES.findAll({
                include: [
                    {
                        model: db.eventos,
                        as: 'evento',
                        attributes: ['idEvento', 'nombreEvento', 'fechaHoraInicio', 'fechaHoraFin', 'descripcion']
                    },
                    {
                        model: db.detalle_horarios,
                        as: 'detalleHorario',
                        attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado'],
                        include: [ 
                            { 
                                model: db.horarios, 
                                as: 'horario', 
                                attributes: ['idHorario', 'horarioInicio', 'horarioFinal', 'estado'] 
                            },
                            { 
                                model: db.categoria_horarios, 
                                as: 'categoriaHorario', 
                                attributes: ['idCategoriaHorario', 'categoria', 'estado'] 
                            }
                        ]
                    }
                ],
                where: {
                    estado: 1
                }
            });
            return res.status(200).json(comisiones);
        } catch (error) {
            console.error('Error al recuperar las comisiones:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // Obtener todas las comisiones activas
    async findActive(req, res) {
        try {
            const comisiones = await COMISIONES.findAll({
                where: {
                    estado: 1
                },
                include: [
                    {
                        model: db.eventos,
                        as: 'evento',
                        attributes: ['idEvento', 'nombreEvento', 'fechaHoraInicio', 'fechaHoraFin', 'descripcion']
                    },
                    {
                        model: db.detalle_horarios,
                        as: 'detalleHorario',
                        attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado'],
                        include: [ 
                            { 
                                model: db.horarios, 
                                as: 'horario', 
                                attributes: ['idHorario', 'horarioInicio', 'horarioFinal', 'estado'] 
                            },
                            { 
                                model: db.categoria_horarios, 
                                as: 'categoriaHorario', 
                                attributes: ['idCategoriaHorario', 'categoria', 'estado'] 
                            }
                        ]
                    }
                ]
            });
            return res.status(200).json(comisiones);
        } catch (error) {
            console.error('Error al listar las comisiones activas:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar las comisiones activas.'
            });
        }
    },

    
    async findActiveComiById(req, res) {
        const { idVoluntario } = req.query; // Obtener el ID del voluntario desde la solicitud

        try {
            const comisiones = await COMISIONES.findAll({
                where: {
                    estado: 1 // Solo comisiones activas
                },
                include: [
                    {
                        model: db.eventos,
                        as: 'evento', // Alias definido en el modelo
                        attributes: ['idEvento', 'nombreEvento', 'fechaHoraInicio', 'fechaHoraFin', 'descripcion']
                    },
                    {
                        model: db.detalle_horarios,
                        as: 'detalleHorario', // Alias definido en el modelo
                        attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado'],
                        include: [
                            {
                                model: db.horarios,
                                as: 'horario',
                                attributes: ['idHorario', 'horarioInicio', 'horarioFinal', 'estado']
                            },
                            {
                                model: db.categoria_horarios,
                                as: 'categoriaHorario',
                                attributes: ['idCategoriaHorario', 'categoria', 'estado']
                            }
                        ]
                    },
                    {
                        model: db.inscripcion_comisiones, // Usa el nombre del modelo directamente
                        attributes: ['idVoluntario'], // Atributos que necesitas
                        where: idVoluntario ? { idVoluntario } : {}, // Filtrar por idVoluntario
                        required: false // Incluir aunque no haya inscripciones
                    }
                ]
            });

            // Añadir el campo `isInscrito` a cada comisión
            const comisionesConEstado = comisiones.map((comision) => ({
                ...comision.toJSON(),
                isInscrito: comision.inscripcion_comisiones && comision.inscripcion_comisiones.length > 0 // Verifica si hay inscripciones
            }));

            return res.status(200).json(comisionesConEstado);
        } catch (error) {
            console.error('Error al listar las comisiones activas:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar las comisiones activas.'
            });
        }
    },


    // Obtener todas las comisiones inactivas
    async findInactive(req, res) {
        try {
            const comisiones = await COMISIONES.findAll({
                where: {
                    estado: 0
                },
                include: [
                    {
                        model: db.eventos,
                        as: 'evento',
                        attributes: ['idEvento', 'nombreEvento', 'fechaHoraInicio', 'fechaHoraFin', 'descripcion']
                    },
                    {
                        model: db.detalle_horarios,
                        as: 'detalleHorario',
                        attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado'],
                        include: [ 
                            { 
                                model: db.horarios, 
                                as: 'horario', 
                                attributes: ['idHorario', 'horarioInicio', 'horarioFinal', 'estado'] 
                            },
                            { 
                                model: db.categoria_horarios, 
                                as: 'categoriaHorario', 
                                attributes: ['idCategoriaHorario', 'categoria', 'estado'] 
                            }
                        ]
                    }
                ]
            });
            return res.status(200).json(comisiones);
        } catch (error) {
            console.error('Error al listar las comisiones inactivas:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar las comisiones inactivas.'
            });
        }
    },

    // Método en el controlador de comisiones
async findInscripcionesByComision(req, res) {
    const { idComision, idVoluntario } = req.params;

    try {
        const inscripcionComision = await db.inscripcion_comisiones.findOne({
            where: {
                idComision,
                idVoluntario
            },
            include: [
                {
                    model: db.inscripcion_eventos,
                    as: 'inscripcionEvento',
                    attributes: ['idInscripcionEvento', 'idEvento']
                }
            ]
        });

        if (!inscripcionComision) {
            return res.status(404).json({ message: 'No se encontró la inscripción para la comisión proporcionada.' });
        }

        return res.status(200).json(inscripcionComision);
    } catch (error) {
        console.error('Error al buscar inscripciones:', error);
        return res.status(500).json({ message: 'Error al buscar inscripciones.' });
    }
},


    // Obtener comisión por ID 
    async findById(req, res) {
        const id = req.params.id;

        try {
            const comision = await COMISIONES.findByPk(id);

            if (!comision) {
                return res.status(404).json({ message: 'Comisión no encontrada' });
            }

            return res.status(200).json(comision);
        } catch (error) {
            console.error(`Error al buscar comisión con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar la comisión.'
            });
        }
    },

    // Crear una nueva comisión
    async create(req, res) {
        const { comision, descripcion, idEvento, idDetalleHorario } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1; // Valor predeterminado de estado: 1

        if (!comision || !descripcion || !idEvento || !idDetalleHorario) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        // Validación de solo letras y espacios
        const regexComision = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
        if (!regexComision.test(comision)) {
            return res.status(400).json({ message: 'El nombre de la comisión solo puede contener letras y espacios.' });
        }

        try {
            // Verificar si el evento existe
            const eventoExistente = await db.eventos.findByPk(idEvento);
            if (!eventoExistente) {
                return res.status(400).json({ message: 'El idEvento proporcionado no existe.' });
            }

            // Verificar si el detalle horario existe
            const detalleHorarioExistente = await db.detalle_horarios.findByPk(idDetalleHorario);
            if (!detalleHorarioExistente) {
                return res.status(400).json({ message: 'El idDetalleHorario proporcionado no existe.' });
            }

            const nuevaComision = {
                comision,
                descripcion,
                estado,
                idEvento,
                idDetalleHorario
            };

            const comisionCreada = await COMISIONES.create(nuevaComision);
            return res.status(201).json({
                message: 'Comisión creada con éxito',
                createdComision: comisionCreada
            });
        } catch (error) {
            console.error('Error al insertar la comisión:', error);
            return res.status(500).json({ error: 'Error al insertar la comisión' });
        }
    },

        // Obtener comisiones por ID de Evento
        async findByEvento(req, res) {
            const { eventoId } = req.query; // Solo se requiere `eventoId`
        
            try {
                if (!eventoId) {
                    return res.status(400).json({ message: 'Se requiere el ID del evento.' });
                }

                // Obtener inscripciones activas del evento
                const inscripciones = await INSCRIPCION_COMISION.findAll({
                    where: { estado: 1 },
                    include: [
                        {
                            model: db.comisiones,
                            attributes: ['idComision', 'idEvento'],
                            where: { idEvento: eventoId }
                        }
                    ]
                });

                // Agrupar inscripciones por idComision
                const inscripcionesPorComision = inscripciones.reduce((acc, inscripcion) => {
                    if (!acc[inscripcion.idComision]) {
                        acc[inscripcion.idComision] = 0;
                    }
                    acc[inscripcion.idComision]++;
                    return acc;
                }, {});
        
                const comisiones = await COMISIONES.findAll({
                    where: { idEvento: eventoId },
                    include: [
                        {
                            model: db.eventos,
                            as: 'evento',
                            attributes: ['idEvento', 'nombreEvento', 'fechaHoraInicio', 'fechaHoraFin', 'descripcion']
                        },
                        {
                            model: db.detalle_horarios,
                            as: 'detalleHorario',
                            attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado'],
                            include: [
                                {
                                    model: db.horarios,
                                    as: 'horario',
                                    attributes: ['idHorario', 'horarioInicio', 'horarioFinal', 'estado']
                                }
                            ]
                        }
                    ]
                });
        
                if (!comisiones.length) {
                    return res.status(404).json({ message: 'No se encontraron comisiones para este evento.' });
                }

                // Filtrar comisiones según cantidadPersonas y inscripciones activas
                const filteredComisiones = comisiones.filter(comision => {
                    const detalleHorario = comision.detalleHorario;
                    if (!detalleHorario) return true;

                    const { idComision } = comision;
                    const { cantidadPersonas } = detalleHorario;

                    const inscripcionCount = inscripcionesPorComision[idComision] || 0;
                    return inscripcionCount < cantidadPersonas;
                });
        
                // Agregar información adicional como horarioInicio y horarioFinal
                const formattedComisiones = filteredComisiones.map((comision) => {
                    const detalleHorario = comision.detalleHorario || null;
                    const horario = detalleHorario ? detalleHorario.horario : null;
        
                    return {
                        ...comision.toJSON(),
                        horarioInicio: horario ? horario.horarioInicio : null,
                        horarioFinal: horario ? horario.horarioFinal : null
                    };
                });
        
                return res.status(200).json(formattedComisiones);
            } catch (error) {
                console.error('Error al recuperar comisiones por evento:', error);
                return res.status(500).json({ message: 'Error al recuperar comisiones por evento.' });
            }
        },
        
        async findByEventoFront(req, res) {
            const { eventoId } = req.query; // Solo se requiere `eventoId`
        
            try {
                if (!eventoId) {
                    return res.status(400).json({ message: 'Se requiere el ID del evento.' });
                }
        
                const comisiones = await COMISIONES.findAll({
                    where: { idEvento: eventoId },
                    include: [
                        {
                            model: db.eventos,
                            as: 'evento',
                            attributes: ['idEvento', 'nombreEvento', 'fechaHoraInicio', 'fechaHoraFin', 'descripcion']
                        },
                        {
                            model: db.detalle_horarios,
                            as: 'detalleHorario',
                            attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado'],
                            include: [
                                {
                                    model: db.horarios,
                                    as: 'horario',
                                    attributes: ['idHorario', 'horarioInicio', 'horarioFinal', 'estado']
                                }
                            ]
                        }
                    ]
                });
        
                if (!comisiones.length) {
                    return res.status(404).json({ message: 'No se encontraron comisiones para este evento.' });
                }
        
                // Agregar información adicional como horarioInicio y horarioFinal
                const formattedComisiones = comisiones.map((comision) => {
                    const detalleHorario = comision.detalleHorario || null;
                    const horario = detalleHorario ? detalleHorario.horario : null;
        
                    return {
                        ...comision.toJSON(),
                        horarioInicio: horario ? horario.horarioInicio : null,
                        horarioFinal: horario ? horario.horarioFinal : null
                    };
                });
        
                return res.status(200).json(formattedComisiones);
            } catch (error) {
                console.error('Error al recuperar comisiones por evento:', error);
                return res.status(500).json({ message: 'Error al recuperar comisiones por evento.' });
            }
        },

    // Actualizar una comisión existente
    async update(req, res) {
        const { comision, descripcion, estado, idEvento, idDetalleHorario } = req.body;
        const id = req.params.id;

        const camposActualizados = {};

        // Validación del nombre de la comisión
        if (comision !== undefined) {
            const regexComision = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
            if (!regexComision.test(comision)) {
                return res.status(400).json({ message: 'El nombre de la comisión solo puede contener letras y espacios.' });
            }
            camposActualizados.comision = comision;
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

        if (idEvento !== undefined) {
            const eventoExistente = await db.eventos.findByPk(idEvento);
            if (!eventoExistente) {
                return res.status(400).json({ message: 'El idEvento proporcionado no existe.' });
            }
            camposActualizados.idEvento = idEvento;
        }

        if (idDetalleHorario !== undefined) {
            const detalleHorarioExistente = await db.detalle_horarios.findByPk(idDetalleHorario);
            if (!detalleHorarioExistente) {
                return res.status(400).json({ message: 'El idDetalleHorario proporcionado no existe.' });
            }
            camposActualizados.idDetalleHorario = idDetalleHorario;
        }

        try {
            const [rowsUpdated] = await COMISIONES.update(
                camposActualizados,
                {
                    where: { idComision: id }
                }
            );

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Comisión no encontrada' });
            }

            const comisionActualizada = await COMISIONES.findByPk(id);
            return res.status(200).json({
                message: `La comisión con ID: ${id} ha sido actualizada`,
                updatedComision: comisionActualizada
            });
        } catch (error) {
            console.error(`Error al actualizar la comisión con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar la comisión' });
        }
    },

    // Eliminar una comisión
    async delete(req, res) {
        const id = req.params.id; 
    
        try {
            const comision = await COMISIONES.findByPk(id);
    
            if (!comision) {
                return res.status(404).json({ error: 'Comisión no encontrada' });
            }
    
            await comision.destroy();
            return res.status(200).json({ message: 'Comisión eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar la comisión:', error);
            return res.status(500).json({ error: 'Error al eliminar la comisión' });
        }
    }
};
