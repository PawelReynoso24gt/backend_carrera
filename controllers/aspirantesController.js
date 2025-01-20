'use strict';

const db = require('../models');
const ASPIRANTES = db.aspirantes;
const VOLUNTARIOS = db.voluntarios;
const PERSONAS = db.personas;
const moment = require('moment');
const { Op } = require('sequelize');

module.exports = {
    async acceptAspirante(req, res) {
        const { idAspirante } = req.params;

        try {
            // Buscar el aspirante por ID
            const aspirante = await ASPIRANTES.findByPk(idAspirante);

            if (!aspirante) {
                return res.status(404).json({ message: 'Aspirante no encontrado.' });
            }

            if (aspirante.estado === 0) {
                return res.status(400).json({ message: 'El aspirante ya ha sido aceptado.' });
            }

            // Actualizar el estado del aspirante a inactivo (0)
            aspirante.estado = 0;
            await aspirante.save();

            // Crear un nuevo voluntario en base al aspirante
            const nuevoVoluntario = await VOLUNTARIOS.create({
                idPersona: aspirante.idPersona,
                codigoQR: `VOL-${aspirante.idPersona}-${Date.now()}`, // Generar un código QR único
                fechaRegistro: new Date(),
                estado: 1, // Estado activo
            });

            // Retornar la respuesta con el aspirante actualizado y el voluntario creado
            return res.status(200).json({
                message: 'Aspirante aceptado y voluntario creado exitosamente.',
                aspirante,
                voluntario: nuevoVoluntario,
            });
        } catch (error) {
            console.error('Error al aceptar el aspirante:', error);
            return res.status(500).json({
                message: error.message || 'Error al aceptar el aspirante y crear el voluntario.',
            });
        }
    },

    // * traer un solo aspirante
    async findOne(req, res) {
        const { idAspirante } = req.params;

        try {
            const aspirante = await ASPIRANTES.findByPk(idAspirante, {
                include: [
                    {
                        model: PERSONAS,
                        attributes: [
                            'idPersona',
                            'nombre',
                            'fechaNacimiento',
                            'telefono',
                            'domicilio',
                            'CUI',
                            'correo',
                        ],
                    },
                ],
            });

            if (!aspirante) {
                return res.status(404).json({ message: 'Aspirante no encontrado.' });
            }

            return res.status(200).json(aspirante);
        } catch (error) {
            console.error('Error al buscar el aspirante:', error);
            return res.status(500).json({
                message: error.message || 'Error al buscar el aspirante.',
            });
        }
    },

        // * Verificar el estado de un aspirante por ID
    async verifyStatus(req, res) {
        const { idAspirante } = req.params;

        try {
            // Buscar el aspirante por su ID
            const aspirante = await ASPIRANTES.findByPk(idAspirante);

            if (!aspirante) {
                return res.status(404).json({ message: 'Aspirante no encontrado.' });
            }

            // Retornar el estado del aspirante
            return res.status(200).json({ estado: aspirante.estado });
        } catch (error) {
            console.error('Error al verificar el estado del aspirante:', error);
            return res.status(500).json({
                message: error.message || 'Error al verificar el estado del aspirante.',
            });
        }
    },

    // * Listar todos los aspirantes
    async findAll(req, res) {
        return ASPIRANTES.findAll()
        .then((aspirantes) => {
            res.status(200).send(aspirantes);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los aspirantes.'
            });
        });
    },



    // * Listar todos los aspirantes activos
    async findActive(req, res) {
        return ASPIRANTES.findAll({
            where: {
                estado: 1
            }
        })
        .then((aspirantes) => {
            res.status(200).send(aspirantes);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los aspirantes activos.'
            });
        });
    },

    // * Listar todos los aspirantes inactivos
    async findInactive(req, res) {
        return ASPIRANTES.findAll({
            where: {
                estado: 0
            }
        })
        .then((aspirantes) => {
            res.status(200).send(aspirantes);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los aspirantes inactivos.'
            });
        });
    },

    // * Crear un nuevo aspirante
    async create(req, res) {
        const { fechaRegistro, idPersona } = req.body;

        if (!fechaRegistro) {
            return res.status(400).json({ message: 'Falta el campo requerido: fechaRegistro.' });
        }
        if (!idPersona) {
            return res.status(400).json({ message: 'Falta el campo requerido: idPersona.' });
        }

        try {
            const nuevoAspirante = await ASPIRANTES.create({
                fechaRegistro,
                idPersona,
                estado: 1
            });

            return res.status(201).json(nuevoAspirante);
        } catch (error) {
            console.error('Error al crear el aspirante:', error);
            return res.status(500).json({
                message: error.message || 'Error al crear el aspirante.'
            });
        }
    },

    // * Actualizar un aspirante
    async update(req, res) {
        const { idAspirante } = req.params;
        const { fechaRegistro, idPersona, estado } = req.body;

        const camposActualizados = {};

        if (fechaRegistro !== undefined) {
            camposActualizados.fechaRegistro = fechaRegistro;
        }

        if (idPersona !== undefined) {
            camposActualizados.idPersona = idPersona;
        }

        if (estado !== undefined) {
            camposActualizados.estado = estado;
        }

        try {
            const [rowsUpdated] = await ASPIRANTES.update(camposActualizados, {
                where: { idAspirante }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Aspirante no encontrado.' });
            }

            return res.status(200).json({ message: 'Aspirante actualizado con éxito.' });
        } catch (error) {
            console.error('Error al actualizar el aspirante:', error);
            return res.status(500).json({
                message: error.message || 'Error al actualizar el aspirante.'
            });
        }
    },

    // * Buscar un aspirante por ID
    async findById(req, res) {
        const { idAspirante } = req.params;

        return ASPIRANTES.findByPk(idAspirante)
        .then((aspirante) => {
            if (!aspirante) {
                return res.status(404).send({ message: 'Aspirante no encontrado.' });
            }
            res.status(200).send(aspirante);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar el aspirante por ID.'
            });
        });
    },

    // * Eliminar un aspirante por ID
    async delete(req, res) {
        const { idAspirante } = req.params;

        return ASPIRANTES.destroy({
            where: { idAspirante }
        })
        .then((deleted) => {
            if (deleted === 0) {
                return res.status(404).send({ message: 'Aspirante no encontrado.' });
            }
            res.status(200).send({ message: 'Aspirante eliminado con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al eliminar el aspirante.'
            });
        });
    },

    // Metodo para reporte de aspirantes
    async reporteAspirantes(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.body;
    
            // Verificar que las fechas se proporcionen
            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({ message: 'Se requieren las fechas de inicio y fin.' });
            }
    
            // Convertir las fechas de formato DD-MM-YYYY a YYYY-MM-DD
            const fechaInicioFormato = fechaInicio.split("-").reverse().join("-");
            const fechaFinFormato = fechaFin.split("-").reverse().join("-");
    
            // Validar que las fechas sean válidas
            const fechaInicioValida = moment(fechaInicioFormato, 'YYYY-MM-DD', true).isValid();
            const fechaFinValida = moment(fechaFinFormato, 'YYYY-MM-DD', true).isValid();
    
            if (!fechaInicioValida || !fechaFinValida) {
                return res.status(400).json({ message: 'Las fechas no son válidas. Formato esperado: DD-MM-YYYY' });
            }
    
            // Realizar la consulta para obtener los datos
            const aspirantes = await ASPIRANTES.findAll({
                where: {
                    estado: 1, // Solo registros activos
                    fechaRegistro: {
                        [Op.gte]: fechaInicioFormato,
                        [Op.lte]: fechaFinFormato,
                    },
                },
                include: [
                    {
                        model: PERSONAS,
                        attributes: [
                            'idPersona',
                            'nombre',
                            'fechaNacimiento',
                            'telefono',
                            'domicilio',
                            'CUI',
                            'correo',
                        ],
                    },
                ],
            });
    
            if (!aspirantes || aspirantes.length === 0) {
                return res.status(404).json({ message: 'No se encontraron aspirantes en el rango de fechas especificado.' });
            }
    
            // Preparar el reporte
            const reporte = aspirantes.map((aspirante) => {
                const persona = aspirante.persona || {};
                return {
                    idAspirante: aspirante.idAspirante,
                    idPersona: persona.idPersona || "No disponible",
                    nombre: persona.nombre || "No disponible",
                    fechaNacimiento: persona.fechaNacimiento ? moment(persona.fechaNacimiento).format('DD-MM-YYYY') : "No disponible",
                    telefono: persona.telefono || "No disponible",
                    domicilio: persona.domicilio || "No disponible",
                    CUI: persona.CUI || "No disponible",
                    correo: persona.correo || "No disponible",
                    fechaRegistro: moment(aspirante.fechaRegistro).format('DD-MM-YYYY'),
                };
            });
    
            // Totales del reporte
            const totales = {
                totalAspirantes: aspirantes.length,
            };
    
            // Enviar el reporte como respuesta
            return res.status(200).json({ reporte, totales });
        } catch (error) {
            console.error('Error al generar el reporte de aspirantes:', error);
            return res.status(500).json({ message: 'Error al generar el reporte de aspirantes.' });
        }
    }
};
