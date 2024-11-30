'use strict';
const { zonedTimeToUtc, format } = require('date-fns-tz');
const db = require("../models");
const { where } = require('sequelize');
const PUBLICACIONES = db.publicaciones;
const SEDES = db.sedes;

module.exports = {
    // Obtener todas las publicaciones
    async find(req, res) {
        try {
        const publicaciones = await PUBLICACIONES.findAll({
            include: [
            {
                model: SEDES,
                as: 'sede',
                attributes: ['idSede', 'nombreSede']
            }
            ],
            where: {
                estado: 1
            }
        });
        return res.status(200).json(publicaciones);
        } catch (error) {
        console.error('Error al recuperar las publicaciones:', error);
        return res.status(500).json({
            message: 'Ocurrió un error al recuperar las publicaciones.'
        });
        }
    },

    // Obtener todas las publicaciones activas
    async findActive(req, res) {
        try {
        const publicaciones = await PUBLICACIONES.findAll({
            where: { estado: 1 },
            include: [
            {
                model: SEDES,
                as: 'sede',
                attributes: ['idSede', 'nombreSede']
            }
            ]
        });
        return res.status(200).json(publicaciones);
        } catch (error) {
        console.error('Error al listar las publicaciones activas:', error);
        return res.status(500).json({
            message: error.message || 'Error al listar las publicaciones activas.'
        });
        }
    },

    // Obtener todas las publicaciones inactivas
    async findInactive(req, res) {
        try {
        const publicaciones = await PUBLICACIONES.findAll({
            where: { estado: 0 },
            include: [
            {
                model: SEDES,
                as: 'sede',
                attributes: ['idSede', 'nombreSede']
            }
            ]
        });
        return res.status(200).json(publicaciones);
        } catch (error) {
        console.error('Error al listar las publicaciones inactivas:', error);
        return res.status(500).json({
            message: error.message || 'Error al listar las publicaciones inactivas.'
        });
        }
    },

    // Obtener una publicación por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
        const publicacion = await PUBLICACIONES.findByPk(id, {
            include: [
            {
                model: SEDES,
                as: 'sede',
                attributes: ['idSede', 'nombreSede']
            }
            ]
        });

        if (!publicacion) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }

        return res.status(200).json(publicacion);
        } catch (error) {
        console.error(`Error al buscar la publicación con ID ${id}:`, error);
        return res.status(500).json({
            message: 'Ocurrió un error al recuperar la publicación.'
        });
        }
    },

    // Crear una nueva publicación
    async create(req, res) {
        const { nombrePublicacion, descripcion, idSede } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1;

        if (!nombrePublicacion || !descripcion || !idSede) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            const nuevaPublicacion = await PUBLICACIONES.create({
            nombrePublicacion,
            descripcion,
            idSede,
            estado,
            fechaPublicacion: new Date(), // Fecha de creación actual
            });

            // Convertir fecha al formato UTC-6 para la respuesta
            const publicacionConFormato = {
            ...nuevaPublicacion.toJSON(),
            fechaPublicacion: format(new Date(nuevaPublicacion.fechaPublicacion), "yyyy-MM-dd HH:mm:ss", {
                timeZone: "America/Guatemala",
            }),
            };

            return res.status(201).json({
            message: "Publicación creada con éxito",
            createdPublicacion: publicacionConFormato,
            });
        } catch (error) {
            console.error("Error al crear la publicación:", error);
            return res.status(500).json({ message: "Error al crear la publicación." });
        }
    },

    // Actualizar una publicación existente
    async update(req, res) {
        const { nombrePublicacion, fechaPublicacion, descripcion, estado, idSede } = req.body;
        const id = req.params.id;
    
        const camposActualizados = {};
    
        if (nombrePublicacion !== undefined) camposActualizados.nombrePublicacion = nombrePublicacion;
        if (fechaPublicacion !== undefined) camposActualizados.fechaPublicacion = fechaPublicacion;
        if (descripcion !== undefined) camposActualizados.descripcion = descripcion;
        if (estado !== undefined) camposActualizados.estado = estado;
    
        if (idSede !== undefined) {
            const sedeExistente = await SEDES.findByPk(idSede);
            if (!sedeExistente) {
                return res.status(400).json({ message: 'La sede especificada no existe.' });
            }
            camposActualizados.idSede = idSede;
        }
    
        try {
            const [rowsUpdated] = await PUBLICACIONES.update(camposActualizados, {
                where: { idPublicacion: id }
            });
    
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Publicación no encontrada' });
            }
    
            const publicacionActualizada = await PUBLICACIONES.findByPk(id, {
                include: [
                    {
                        model: SEDES,
                        as: 'sede',
                        attributes: ['idSede', 'nombreSede']
                    }
                ]
            });
    
            // Convertir la fecha de la publicación a UTC-6 para la respuesta
            const publicacionConFormato = {
                ...publicacionActualizada.toJSON(),
                fechaPublicacion: format(new Date(publicacionActualizada.fechaPublicacion), "yyyy-MM-dd HH:mm:ss", {
                    timeZone: "America/Guatemala",
                }),
            };
    
            return res.status(200).json({
                message: `La publicación con ID: ${id} ha sido actualizada`,
                updatedPublicacion: publicacionConFormato,
            });
        } catch (error) {
            console.error(`Error al actualizar la publicación con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar la publicación' });
        }
    },

    // Eliminar una publicación
    async delete(req, res) {
        const id = req.params.id;

        try {
        const publicacion = await PUBLICACIONES.findByPk(id);

        if (!publicacion) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        await publicacion.destroy();
        return res.status(200).json({ message: 'Publicación eliminada correctamente' });
        } catch (error) {
        console.error('Error al eliminar la publicación:', error);
        return res.status(500).json({ error: 'Error al eliminar la publicación' });
        }
    }
};
