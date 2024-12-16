'use strict';

const db = require('../models');
const TIPO_NOTIFICACIONES = db.tipo_notificaciones;

module.exports = {
    // Obtener todas las notificaciones para un idPersona específico
    async find(req, res) {
        try {
            const tipo_notificaciones = await TIPO_NOTIFICACIONES.findAll({
            });
            return res.status(200).json(tipo_notificaciones);
        } catch (error) {
            console.error('Error al recuperar las tipo_notificaciones:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },
};
