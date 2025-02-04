'use strict';

const { zonedTimeToUtc, format } = require('date-fns-tz');
const { parse, isValid } = require('date-fns'); // isValid para validar fechas
const db = require("../models");
const RIFAS = db.rifas;
const SEDES = db.sedes;
const TALONARIOS = db.talonarios;
const SOLICITUD_TALONARIOS = db.solicitudTalonarios;
const VOLUNTARIOS = db.voluntarios;
const PERSONAS = db.personas;

// Métodos CRUD
module.exports = {

    // Obtener todas las rifas con estado activo
    async find(req, res) {
        try {
            const rifas = await RIFAS.findAll({
                include: {
                    model: SEDES,
                    attributes: ["idSede", "nombreSede"]
                },
                where: {
                    estado: 1
                }
            });
            return res.status(200).json(rifas);
        } catch (error) {
            console.error('Error al recuperar los tipos de publicos:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // Obtener todas las rifas activas
    async findActive(req, res) {
        try {
            const rifas = await RIFAS.findAll({
                where: {
                    estado: 1
                },
                include: {
                    model: SEDES,
                    attributes: ["idSede", "nombreSede"]
                }
            });
            return res.status(200).json(rifas);
        } catch (error) {
            console.error('Error al listar las rifas activas:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar las rifas activas.'
            });
        }
    },

    // Obtener todas las rifas inactivas
    async findInactive(req, res) {
        try {
            const rifas = await RIFAS.findAll({
                where: {
                    estado: 0
                },
                include: {
                    model: SEDES,
                    attributes: ["idSede", "nombreSede"]
                }
            });
            return res.status(200).json(rifas);
        } catch (error) {
            console.error('Error al listar las rifas inactivas:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar las rifas inactivas.'
            });
        }
    },

    // Obtener los talonarios con solicitudes por rifa
    async findTalonariosVoluntarios(req, res) {
        const { idRifa } = req.params;

        try {
            // Validar que se haya proporcionado un idRifa válido
            if (!idRifa) {
                return res.status(400).json({ message: 'El idRifa es requerido.' });
            }

            // Consultar los talonarios asociados a la rifa
            const talonarios = await TALONARIOS.findAll({
                where: { idRifa },
                include: [
                    {
                        model: RIFAS, // Incluir la información de la rifa
                        attributes: ['idRifa', 'nombreRifa', 'precioBoleto', 'descripcion', 'estado'],
                    },
                    {
                        model: SOLICITUD_TALONARIOS, // Información de las solicitudes asociadas
                        where: { estado: 2 }, // Filtrar por solicitudes aceptadas
                        required: true,
                        include: [
                            {
                                model: VOLUNTARIOS, // Información de los voluntarios en las solicitudes
                                include: [
                                    {
                                        model: PERSONAS, // Información adicional del voluntario
                                        attributes: ['idPersona', 'nombre', 'telefono', 'correo'],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });

            // Verificar si se encontraron resultados
            if (!talonarios || talonarios.length === 0) {
                return res.status(404).json({ message: 'No se encontraron talonarios para esta rifa.' });
            }

            // Responder con los datos
            return res.status(200).json(talonarios);
        } catch (error) {
            console.error('Error al obtener talonarios por rifa:', error);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }
    },

    // Obtener los voluntarios con talonarios solicitados por rifa
    async findVoluntariosTalonarios(req, res) {
        const { idRifa, idVoluntario } = req.params;

        try {
            // Validar que se haya proporcionado un idRifa válido
            if (!idRifa) {
                return res.status(400).json({ message: 'El idRifa es requerido.' });
            }

            // Validar que se haya proporcionado un idVoluntario válido
            if (!idVoluntario) {
                return res.status(400).json({ message: 'El idVoluntario es requerido.' });
            }

            // Consultar los talonarios asociados a la rifa y solicitados por el voluntario
            const talonarios = await TALONARIOS.findAll({
                where: { idRifa },
                include: [
                    {
                        model: RIFAS, // Incluir la información de la rifa
                        attributes: ['nombreRifa', 'precioBoleto', 'descripcion', 'estado'],
                    },
                    {
                        model: SOLICITUD_TALONARIOS, // Información de las solicitudes asociadas
                        required: true,
                        where: { idVoluntario }, // Filtrar por el voluntario
                        include: [
                            {
                                model: VOLUNTARIOS, // Información de los voluntarios en las solicitudes
                                include: [
                                    {
                                        model: PERSONAS, // Información adicional del voluntario
                                        attributes: ['idPersona', 'nombre', 'telefono', 'correo'],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });

            // Verificar si se encontraron resultados
            if (!talonarios || talonarios.length === 0) {
                return res.status(404).json({ message: 'No se encontraron talonarios para esta rifa y voluntario.' });
            }

            // Responder con los datos
            return res.status(200).json(talonarios);
        } catch (error) {
            console.error('Error al obtener talonarios por rifa y voluntario:', error);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }
    },

    // Obtener rifa por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const rifa = await RIFAS.findByPk(id, {
                include: {
                    model: SEDES,
                    attributes: ["idSede", "nombreSede"]
                }
            });

            if (!rifa) {
                return res.status(404).json({ message: 'Rifa no encontrada' });
            }

            return res.status(200).json(rifa);
        } catch (error) {
            console.error(`Error al buscar rifa con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar la rifa.'
            });
        }
    },

    // Crear una nueva rifa
    async create(req, res) {
        const datos = req.body;

        // Verificar campos requeridos
        if (!datos.nombreRifa || !datos.descripcion || !datos.idSede || !datos.precioBoleto || !datos.fechaInicio || !datos.fechaFin) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        // Validación de nombreRifa y descripcion con expresión regular
        const regexRifa = /^[a-zA-ZáéíóúÁÉÍÓÚÑñ0-9\s-]+$/; // Ajusta la expresión regular según tus necesidades

        if (!regexRifa.test(datos.nombreRifa)) {
            return res.status(400).json({ message: 'El nombre de la rifa contiene caracteres no válidos.' });
        }

        // Validación de fechas
        const fechaInicio = parse(datos.fechaInicio, "yyyy-MM-dd", new Date(), {
            timeZone: "America/Guatemala",
        });
        const fechaFin = parse(datos.fechaFin, "yyyy-MM-dd", new Date(), {
            timeZone: "America/Guatemala",
        });

        if (!isValid(fechaInicio) || !isValid(fechaFin)) {
            return res.status(400).json({ message: 'Una o ambas fechas no son válidas.' });
        }

        // Verificar si la sede existe
        const sede = await SEDES.findByPk(datos.idSede);
        if (!sede) {
            return res.status(400).json({ message: 'La sede especificada no existe.' });
        }

        const nuevaRifa = {
            nombreRifa: datos.nombreRifa,
            precioBoleto: datos.precioBoleto,
            descripcion: datos.descripcion,
            fechaInicio,
            fechaFin,
            ventaTotal: 0,
            idSede: datos.idSede,
            estado: datos.estado !== undefined ? datos.estado : 1
        };

        try {
            const rifa = await RIFAS.create(nuevaRifa);
            return res.status(201).json({
                message: 'Rifa creada exitosamente.',
                rifa: rifa
            });
        } catch (error) {
            console.error('Error al insertar la rifa:', error);
            return res.status(500).json({ error: 'Error al insertar la rifa' });
        }
    },

    // Actualizar una rifa existente
    async update(req, res) {
        const datos = req.body;
        const id = req.params.id;

        const camposActualizados = {};

        if (datos.nombreRifa !== undefined) {
            // Validación de nombreRifa
            const regexRifa = /^[a-zA-ZáéíóúÁÉÍÓÚÑñ0-9\s-]+$/;
            if (!regexRifa.test(datos.nombreRifa)) {
                return res.status(400).json({ message: 'El nombre de la rifa contiene caracteres no válidos.' });
            }
            camposActualizados.nombreRifa = datos.nombreRifa;
        }

        if (datos.precioBoleto !== undefined) {
            camposActualizados.precioBoleto = datos.precioBoleto;
        }

        if (datos.descripcion !== undefined) {
            camposActualizados.descripcion = datos.descripcion;
        }

        if (datos.fechaInicio !== undefined) {
            // Validar y convertir fechaInicio
            const fechaInicio = parse(datos.fechaInicio, "yyyy-MM-dd", new Date());
            if (!isValid(fechaInicio)) {
                return res.status(400).json({ message: 'La fecha de inicio no es válida.' });
            }
            camposActualizados.fechaInicio = fechaInicio;
        }

        if (datos.fechaFin !== undefined) {
            // Validar y convertir fechaFin
            const fechaFin = parse(datos.fechaFin, "yyyy-MM-dd", new Date());
            if (!isValid(fechaFin)) {
                return res.status(400).json({ message: 'La fecha de fin no es válida.' });
            }
            camposActualizados.fechaFin = fechaFin;

            // Verificar que fechaFin no sea menor a fechaInicio
            if (camposActualizados.fechaInicio && camposActualizados.fechaFin < camposActualizados.fechaInicio) {
                return res.status(400).json({ message: 'La fecha de fin no puede ser menor a la fecha de inicio.' });
            }
        }

        if (datos.ventaTotal !== undefined) {
            camposActualizados.ventaTotal = datos.ventaTotal;
        }

        if (datos.idSede !== undefined) {
            // Verificar si la sede existe
            const sede = await SEDES.findByPk(datos.idSede);
            if (!sede) {
                return res.status(400).json({ message: 'La sede especificada no existe.' });
            }
            camposActualizados.idSede = datos.idSede;
        }

        if (datos.estado !== undefined) {
            if (![0, 1].includes(datos.estado)) {
                return res.status(400).json({ message: 'El estado debe ser 0 (inactivo) o 1 (activo).' });
            }
            camposActualizados.estado = datos.estado;
        }
        try {
            const [rowsUpdated] = await RIFAS.update(
                camposActualizados,
                {
                    where: { idRifa: id }
                }
            );
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Rifa no encontrada' });
            }
            return res.status(200).json({ message: 'La rifa ha sido actualizada' });
        } catch (error) {
            console.error(`Error al actualizar la rifa con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar la rifa' });
        }
    },

    // Eliminar una rifa
    async delete(req, res) {
        const id = req.params.id;

        try {
            const rifa = await RIFAS.findByPk(id);

            if (!rifa) {
                return res.status(404).json({ error: 'Rifa no encontrada' });
            }

            await rifa.destroy();
            return res.status(200).json({ message: 'Rifa eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar rifa:', error);
            return res.status(500).json({ error: 'Error al eliminar rifa' });
        }
    },

    // Obtener una rifa por ID con todos los talonarios asociados
    async findRifaWithTalonarios(req, res) {
        const id = req.params.id;

        try {
            const rifa = await RIFAS.findByPk(id, {
                include: [
                    {
                        model: TALONARIOS,
                        attributes: ['idTalonario', 'codigoTalonario', 'cantidadBoletos', 'correlativoInicio', 'correlativoFinal', 'estado'],
                    }
                ]
            });

            if (!rifa) {
                return res.status(404).json({ message: 'Rifa no encontrada' });
            }

            return res.status(200).json(rifa);
        } catch (error) {
            console.error(`Error al buscar rifa con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar la rifa.'
            });
        }
    }
};
