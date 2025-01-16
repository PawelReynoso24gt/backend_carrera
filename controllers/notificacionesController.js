'use strict';

const db = require('../models');
const NOTIFICACIONES = db.notificaciones;
const TIPO_NOTIFICACIONES = db.tipo_notificaciones;
const BITACORAS = db.bitacoras;
const PERSONAS = db.personas;

module.exports = {
    // Obtener todas las notificaciones para un idPersona específico
    async find(req, res) {
        try {
            const { idPersona } = req.query; // Obtener el idPersona de los parámetros de la consulta

            // Verificar si se proporcionó idPersona
            if (!idPersona) {
                return res.status(400).json({ message: 'El idPersona es requerido.' });
            }

            const notificaciones = await NOTIFICACIONES.findAll({
                include: [
                    {
                        model: TIPO_NOTIFICACIONES,
                        attributes: ['idTipoNotificacion', 'tipoNotificacion']
                    },
                    {
                        model: BITACORAS,
                        attributes: ['idBitacora', 'descripcion', 'fechaHora']
                    },
                    {
                        model: PERSONAS,
                        attributes: ['idPersona']
                    }
                ],
                where: { 
                    estado: 1, // Solo las activas
                    idPersona: idPersona // Filtrar por idPersona
                }
            });

            return res.status(200).json(notificaciones);
        } catch (error) {
            console.error('Error al obtener las notificaciones:', error);
            return res.status(500).json({ message: 'Error al obtener las notificaciones' });
        }
    },

    async update(req, res) {
        try {
    
            const idNotificacion = req.params.idNotificacion || req.params.id;
            const { estado, fechaHora, idBitacora, idTipoNotificacion, idPersona } = req.body;
    
            if (!idNotificacion) {
                return res.status(400).json({ message: 'El idNotificacion es requerido.' });
            }
    
            const notificacion = await NOTIFICACIONES.findByPk(idNotificacion);
            if (!notificacion) {
                return res.status(404).json({ message: 'Notificación no encontrada.' });
            }
    
            const updatedNotificacion = await notificacion.update({
                estado: estado !== undefined ? estado : notificacion.estado,
                fechaHora: fechaHora !== undefined ? fechaHora : notificacion.fechaHora,
                idBitacora: idBitacora !== undefined ? idBitacora : notificacion.idBitacora,
                idTipoNotificacion: idTipoNotificacion !== undefined ? idTipoNotificacion : notificacion.idTipoNotificacion,
                idPersona: idPersona !== undefined ? idPersona : notificacion.idPersona,
            });
    
            return res.status(200).json(updatedNotificacion);
        } catch (error) {
            console.error('Error al actualizar la notificación:', error);
            return res.status(500).json({ message: 'Error al actualizar la notificación' });
        }
    },
    
    // Crear una nueva notificación
    async create(req, res) {
        try {
            const { idBitacora, idTipoNotificacion, idPersona } = req.body;

            // Verificar que todos los campos necesarios están presentes
            if (!idBitacora || !idTipoNotificacion || !idPersona) {
                return res.status(400).json({ message: 'Todos los campos son requeridos: idBitacora, idTipoNotificacion, idPersona.' });
            }

            // Crear una nueva notificación con estado 1
            const newNotificacion = await NOTIFICACIONES.create({
                idBitacora,
                idTipoNotificacion,
                idPersona,
                estado: 1,
                fechaHora: new Date() // Puedes especificar una fecha y hora personalizada si es necesario
            });

            return res.status(201).json({
                message: "Notificación creada exitosamente",
                notificacion: newNotificacion
            });
        } catch (error) {
            console.error('Error al crear la notificación:', error);
            return res.status(500).json({ message: 'Error al crear la notificación' });
        }
    }
};
