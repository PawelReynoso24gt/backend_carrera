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

        const transaction = await db.sequelize.transaction();
        try {

            // Verificar si la inscripción al evento es válida
            const inscripcion = await INSCRIPCION_EVENTOS.findByPk(idInscripcionEvento);
            if (!inscripcion || inscripcion.estado !== 1) {
                return res.status(400).json({ message: 'La inscripción al evento no es válida o está inactiva.' });
            }

            // Verificar que el stand pertenece al mismo evento que la inscripción
            const stand = await STANDS.findByPk(idStand, { transaction });
            if (!stand || stand.idEvento !== inscripcion.idEvento) {
                return res.status(400).json({ message: 'El stand no pertenece al evento de la inscripción.' });
            }

            // Verificar si el horario tiene cupo disponible
            const horario = await DETALLE_HORARIOS.findByPk(idDetalleHorario, { transaction });
            if (!horario || horario.cantidadPersonas <= 0) {
                return res.status(400).json({ message: 'El horario seleccionado no tiene cupo disponible.' });
            }

            // Crear la asignación
            const nuevaAsignacion = await ASIGNACION_STANDS.create(
                {
                    estado,
                    idInscripcionEvento,
                    idStand,
                    idDetalleHorario,
                },
                { transaction }
            );

            // Actualizar el cupo del horario
            await DETALLE_HORARIOS.update(
                { cantidadPersonas: horario.cantidadPersonas - 1 },
                { where: { idDetalleHorario }, transaction }
            );

            // Confirmar la transacción
            await transaction.commit();

            return res.status(201).json({
                message: 'Asignación creada con éxito',
                createdAsignacion: nuevaAsignacion,
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error al crear la asignación:', error);
            return res.status(500).json({ message: 'Error al crear la asignación.' });
        }
    },


    // Actualizar una asignación existente
    async update(req, res) {
        const { estado, idInscripcionEvento, idStand, idDetalleHorario } = req.body;
        const id = req.params.id;

        const transaction = await db.sequelize.transaction();

        try {
            // Obtener la asignación actual para comparar horarios
            const asignacionActual = await ASIGNACION_STANDS.findByPk(id, {
                transaction,
                include: [
                    {
                        model: DETALLE_HORARIOS,
                        as: 'detalleHorario',
                        attributes: ['idDetalleHorario', 'cantidadPersonas']
                    }
                ]
            });

            if (!asignacionActual) {
                return res.status(404).json({ message: 'Asignación no encontrada' });
            }

            // Verificar si el horario ha cambiado
            const horarioAnteriorId = asignacionActual.idDetalleHorario;

            if (idDetalleHorario && idDetalleHorario !== horarioAnteriorId) {
                // Incrementar el cupo del horario anterior
                await DETALLE_HORARIOS.increment(
                    { cantidadPersonas: 1 },
                    { where: { idDetalleHorario: horarioAnteriorId }, transaction }
                );

                // Verificar si el nuevo horario tiene cupo disponible
                const nuevoHorario = await DETALLE_HORARIOS.findByPk(idDetalleHorario, { transaction });
                if (!nuevoHorario || nuevoHorario.cantidadPersonas <= 0) {
                    throw new Error('El horario seleccionado no tiene cupo disponible.');
                }

                // Decrementar el cupo del nuevo horario
                await DETALLE_HORARIOS.decrement(
                    { cantidadPersonas: 1 },
                    { where: { idDetalleHorario: idDetalleHorario }, transaction }
                );
            }

            // Actualizar los campos de la asignación
            const camposActualizados = {};
            if (estado !== undefined) camposActualizados.estado = estado;
            if (idInscripcionEvento !== undefined) camposActualizados.idInscripcionEvento = idInscripcionEvento;
            if (idStand !== undefined) camposActualizados.idStand = idStand;
            if (idDetalleHorario !== undefined) camposActualizados.idDetalleHorario = idDetalleHorario;

            const [rowsUpdated] = await ASIGNACION_STANDS.update(camposActualizados, {
                where: { idAsignacionStands: id },
                transaction
            });

            if (rowsUpdated === 0) {
                throw new Error('La asignación no pudo ser actualizada.');
            }

            // Confirmar la transacción
            await transaction.commit();

            // Retornar la asignación actualizada
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
                message: `La asignación ha sido actualizada`,
                updatedAsignacion: asignacionActualizada
            });
        } catch (error) {
            // Revertir la transacción en caso de error
            await transaction.rollback();
            console.error(`Error al actualizar la asignación con ID ${id}:`, error);
            return res.status(500).json({ message: `Error al actualizar la asignación: ${error.message}` });
        }
    },

    // Eliminar una asignación
    async delete(req, res) {
        const id = req.params.id;

        const transaction = await db.sequelize.transaction();

        try {
            // Buscar la asignación por ID
            const asignacion = await ASIGNACION_STANDS.findByPk(id, {
                transaction,
                include: [
                    {
                        model: DETALLE_HORARIOS,
                        as: 'detalleHorario',
                        attributes: ['idDetalleHorario', 'cantidadPersonas']
                    }
                ]
            });

            if (!asignacion) {
                return res.status(404).json({ message: 'Asignación no encontrada' });
            }

            const { idDetalleHorario } = asignacion;

            // Incrementar el cupo en el detalle del horario
            await DETALLE_HORARIOS.increment(
                { cantidadPersonas: 1 },
                { where: { idDetalleHorario }, transaction }
            );

            // Eliminar la asignación
            await asignacion.destroy({ transaction });

            // Confirmar la transacción
            await transaction.commit();

            return res.status(200).json({ message: 'Asignación eliminada correctamente' });
        } catch (error) {
            // Revertir la transacción en caso de error
            await transaction.rollback();
            console.error('Error al eliminar la asignación:', error);
            return res.status(500).json({ message: 'Error al eliminar la asignación.' });
        }
    },


    // Obtener voluntarios asignados agrupados por stand
    async findVoluntariosByStand(req, res) {
        try {
            const asignaciones = await ASIGNACION_STANDS.findAll({
                include: [
                    {
                        model: STANDS,
                        as: 'stand',
                        attributes: ['idStand', 'nombreStand', 'direccion']
                    },
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado'],
                        include: [
                            {
                                model: db.voluntarios,
                                as: 'voluntario',
                                attributes: ['idVoluntario', 'estado'], // Atributos del voluntario
                                include: [
                                    {
                                        model: db.personas,
                                        as: 'persona',
                                        attributes: ['idPersona', 'nombre', 'telefono'] // Atributos de la persona
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: DETALLE_HORARIOS,
                        as: 'detalleHorario',
                        attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado'],
                        include: [
                            {
                                model: db.horarios,
                                as: 'horario',
                                attributes: ['horarioInicio', 'horarioFinal', 'estado']
                            }
                        ]
                    }
                ],
                where: { estado: 1 }, // Filtrar asignaciones activas
                attributes: ['idAsignacionStands', 'estado'] // Atributos de asignacion_stands
            });

            // Agrupar asignaciones por stand
            const resultado = asignaciones.reduce((acc, asignacion) => {
                const standId = asignacion.stand.idStand;
                const standNombre = asignacion.stand.nombreStand;

                if (!acc[standId]) {
                    acc[standId] = {
                        standId,
                        standNombre,
                        voluntarios: []
                    };
                }

                acc[standId].voluntarios.push({
                    idVoluntario: asignacion.inscripcionEvento.voluntario.idVoluntario,
                    nombreVoluntario: asignacion.inscripcionEvento.voluntario.persona.nombre,
                    telefonoVoluntario: asignacion.inscripcionEvento.voluntario.persona.telefono,
                    horarioInicio: asignacion.detalleHorario.horario.horarioInicio,
                    horarioFinal: asignacion.detalleHorario.horario.horarioFinal
                });

                return acc;
            }, {});

            return res.status(200).json(Object.values(resultado));
        } catch (error) {
            console.error('Error al obtener los voluntarios por stand:', error);
            return res.status(500).json({
                message: 'Error al obtener los voluntarios por stand.'
            });
        }
    },

    async findVoluntariosByActiveStands(req, res) {
        try {
            const asignaciones = await ASIGNACION_STANDS.findAll({
                include: [
                    {
                        model: STANDS,
                        as: 'stand',
                        attributes: ['idStand', 'nombreStand', 'direccion', 'estado'],
                        where: { estado: 1 }, // Filtrar stands activos
                    },
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado'],
                        include: [
                            {
                                model: db.voluntarios,
                                as: 'voluntario',
                                attributes: ['idVoluntario', 'estado'], // Atributos del voluntario
                                include: [
                                    {
                                        model: db.personas,
                                        as: 'persona',
                                        attributes: ['idPersona', 'nombre', 'telefono'], // Atributos de la persona
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: DETALLE_HORARIOS,
                        as: 'detalleHorario',
                        attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado'],
                        include: [
                            {
                                model: db.horarios,
                                as: 'horario',
                                attributes: ['horarioInicio', 'horarioFinal', 'estado']
                            }
                        ]
                    }
                ],
                attributes: ['idAsignacionStands', 'estado'] // Atributos de asignacion_stands
            });

            // Agrupar asignaciones por stand
            const resultado = asignaciones.reduce((acc, asignacion) => {
                const standId = asignacion.stand.idStand;
                const standNombre = asignacion.stand.nombreStand;

                if (!acc[standId]) {
                    acc[standId] = {
                        standId,
                        standNombre,
                        voluntarios: []
                    };
                }

                acc[standId].voluntarios.push({
                    idVoluntario: asignacion.inscripcionEvento.voluntario.idVoluntario,
                    nombreVoluntario: asignacion.inscripcionEvento.voluntario.persona.nombre,
                    telefonoVoluntario: asignacion.inscripcionEvento.voluntario.persona.telefono,
                    horarioInicio: asignacion.detalleHorario.horario.horarioInicio,
                    horarioFinal: asignacion.detalleHorario.horario.horarioFinal
                });

                return acc;
            }, {});

            return res.status(200).json(Object.values(resultado));
        } catch (error) {
            console.error('Error al obtener los voluntarios por stands activos:', error);
            return res.status(500).json({
                message: 'Error al obtener los voluntarios por stands activos.'
            });
        }
    },

    // Obtener voluntarios asignados a stands inactivos
    async findVoluntariosByInactiveStands(req, res) {
        try {
            const asignaciones = await ASIGNACION_STANDS.findAll({
                include: [
                    {
                        model: STANDS,
                        as: 'stand',
                        attributes: ['idStand', 'nombreStand', 'direccion', 'estado'],
                        where: { estado: 0 }, // Filtrar stands inactivos
                    },
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        attributes: ['idInscripcionEvento', 'fechaHoraInscripcion', 'estado'],
                        include: [
                            {
                                model: db.voluntarios,
                                as: 'voluntario',
                                attributes: ['idVoluntario', 'estado'], // Atributos del voluntario
                                include: [
                                    {
                                        model: db.personas,
                                        as: 'persona',
                                        attributes: ['idPersona', 'nombre', 'telefono'], // Atributos de la persona
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: DETALLE_HORARIOS,
                        as: 'detalleHorario',
                        attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado'],
                        include: [
                            {
                                model: db.horarios,
                                as: 'horario',
                                attributes: ['horarioInicio', 'horarioFinal', 'estado']
                            }
                        ]
                    }
                ],
                attributes: ['idAsignacionStands', 'estado'] // Atributos de asignacion_stands
            });

            // Agrupar asignaciones por stand
            const resultado = asignaciones.reduce((acc, asignacion) => {
                const standId = asignacion.stand.idStand;
                const standNombre = asignacion.stand.nombreStand;

                if (!acc[standId]) {
                    acc[standId] = {
                        standId,
                        standNombre,
                        voluntarios: []
                    };
                }

                acc[standId].voluntarios.push({
                    idVoluntario: asignacion.inscripcionEvento.voluntario.idVoluntario,
                    nombreVoluntario: asignacion.inscripcionEvento.voluntario.persona.nombre,
                    telefonoVoluntario: asignacion.inscripcionEvento.voluntario.persona.telefono,
                    horarioInicio: asignacion.detalleHorario.horario.horarioInicio,
                    horarioFinal: asignacion.detalleHorario.horario.horarioFinal
                });

                return acc;
            }, {});

            return res.status(200).json(Object.values(resultado));
        } catch (error) {
            console.error('Error al obtener los voluntarios por stands inactivos:', error);
            return res.status(500).json({
                message: 'Error al obtener los voluntarios por stands inactivos.'
            });
        }
    },

    async findAsignacionByVoluntario(req, res) {
        const idVoluntario = req.params.idVoluntario;
        try {
            const asignacion = await ASIGNACION_STANDS.findAll({
                where: { estado: 1 },
                include: [
                    {
                        model: INSCRIPCION_EVENTOS,
                        as: 'inscripcionEvento',
                        where: { idVoluntario },
                    },  
                    {
                        model: DETALLE_HORARIOS,
                        as: 'detalleHorario',
                        attributes: ['idDetalleHorario', 'cantidadPersonas', 'estado'],
                        include: [
                            {
                                model: db.horarios,
                                as: 'horario',
                                attributes: ['horarioInicio', 'horarioFinal', 'estado']
                            }
                        ]
                    }
                ]
            });

            if (!asignacion) {
                return res.status(404).json({ message: 'No tienes asignaciones activas.' });
            }

            return res.status(200).json(asignacion);
        } catch (error) {
            console.error('Error fetching assignment by volunteer:', error);
            return res.status(500).json({ message: 'Error al obtener la asignación del voluntario.' });
        }
    }


};
