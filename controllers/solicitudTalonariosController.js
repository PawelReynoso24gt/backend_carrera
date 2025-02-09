'use strict';
const db = require("../models");
const SOLICITUD_TALONARIOS = db.solicitudTalonarios;
const VOLUNTARIOS = db.voluntarios;
const PERSONAS = db.personas;
const TALONARIOS = db.talonarios;

// Métodos CRUD
module.exports = {

    async getAll(req, res) {
        try {
            const solicitudes = await SOLICITUD_TALONARIOS.findAll({
                include: [{
                    model: VOLUNTARIOS,
                    attributes: ['idVoluntario', 'idPersona'],
                    include: [{ 
                        model: PERSONAS, 
                        attributes: ['idPersona', 'nombre'] 
                    }]
                },
                {
                    model: TALONARIOS, // Incluir el modelo TALONARIOS
                    attributes: ['idTalonario', 'codigoTalonario'] // Seleccionar los atributos necesarios
                }]
            });            
            return res.status(200).json(solicitudes);
        } catch (error) {
            console.error('Error al recuperar las solicitudes:', error);
            return res.status(500).json({ message: 'Ocurrió un error al recuperar los datos.' });
        }
    },

    async getById(req, res) {
        const { id } = req.params;
        try {
            const solicitud = await SOLICITUD_TALONARIOS.findByPk(id, {
                include: [
                    {
                        model: VOLUNTARIOS,
                        attributes: ['idVoluntario', 'idPersona'],
                        include: [{ 
                            model: PERSONAS, 
                            attributes: ['idPersona', 'nombre'] 
                        }]
                    },
                    {
                        model: TALONARIOS, // Incluir el modelo TALONARIOS
                        attributes: ['idTalonario', 'codigoTalonario'] // Seleccionar los atributos necesarios
                    }
                ]
            });
            if (!solicitud) {
                return res.status(404).json({ message: 'Solicitud no encontrada.' });
            }
            return res.status(200).json(solicitud);
        } catch (error) {
            console.error(`Error al recuperar la solicitud con ID ${id}:`, error);
            return res.status(500).json({ message: 'Ocurrió un error al recuperar los datos.' });
        }
    },


    async getByDate(req, res) {
        const { fecha } = req.params;
        const [day, month, year] = fecha.split('-');
        const formattedDate = `${year}-${month}-${day}`;
        try {
            const solicitudes = await SOLICITUD_TALONARIOS.findAll({
                where: { fechaSolicitud: formattedDate }
            });
            return res.status(200).json(solicitudes);
        } catch (error) {
            console.error(`Error al recuperar las solicitudes de la fecha ${fecha}:`, error);
            return res.status(500).json({ message: 'Ocurrió un error al recuperar los datos.' });
        }
    },

   
    async getByVoluntario(req, res) {
        const { idVoluntario } = req.params;
        try {
            const solicitudes = await SOLICITUD_TALONARIOS.findAll({
                where: { idVoluntario }
            });
            return res.status(200).json(solicitudes);
        } catch (error) {
            console.error(`Error al recuperar las solicitudes del voluntario con ID ${idVoluntario}:`, error);
            return res.status(500).json({ message: 'Ocurrió un error al recuperar los datos.' });
        }
    },

    // Crear una nueva solicitud
    async create(req, res) {
        const { estado, fechaSolicitud, idTalonario, idVoluntario } = req.body;
        if (!fechaSolicitud || !idTalonario || !idVoluntario) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }
        try {
            const nuevaSolicitud = await SOLICITUD_TALONARIOS.create({
                estado: estado !== undefined ? estado : 1,
                fechaSolicitud,
                idTalonario,
                idVoluntario
            });
            return res.status(201).json(nuevaSolicitud);
        } catch (error) {
            console.error('Error al crear la solicitud:', error);
            return res.status(500).json({ message: 'Error al crear la solicitud.' });
        }
    },

    // Actualizar una solicitud existente
    async update(req, res) {
        const { id } = req.params;
        const { estado, fechaSolicitud, idTalonario, idVoluntario } = req.body;

        try {
            const solicitud = await SOLICITUD_TALONARIOS.findByPk(id);
            if (!solicitud) {
                return res.status(404).json({ message: 'Solicitud no encontrada.' });
            }

            await solicitud.update({
                estado: estado !== undefined ? estado : solicitud.estado,
                fechaSolicitud: fechaSolicitud || solicitud.fechaSolicitud,
                idTalonario: idTalonario || solicitud.idTalonario,
                idVoluntario: idVoluntario || solicitud.idVoluntario
            });

            return res.status(200).json({ message: 'Solicitud actualizada correctamente.' });
        } catch (error) {
            console.error(`Error al actualizar la solicitud con ID ${id}:`, error);
            return res.status(500).json({ message: 'Error al actualizar la solicitud.' });
        }
    },

    // Eliminar una solicitud
    async delete(req, res) {
        const { id } = req.params;

        try {
            const solicitud = await SOLICITUD_TALONARIOS.findByPk(id);
            if (!solicitud) {
                return res.status(404).json({ message: 'Solicitud no encontrada.' });
            }

            await solicitud.destroy();
            return res.status(200).json({ message: 'Solicitud eliminada correctamente.' });
        } catch (error) {
            console.error(`Error al eliminar la solicitud con ID ${id}:`, error);
            return res.status(500).json({ message: 'Error al eliminar la solicitud.' });
        }
    }
};
