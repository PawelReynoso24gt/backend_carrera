'use strict';
const db = require("../models");
const PUBLICACION_RIFAS = db.publicacion_rifas;
const PUBLICACIONES = db.publicaciones;
const RIFAS = db.rifas;

module.exports = {
    // Obtener todas las publicaciones de rifas
    async find(req, res) {
        try {
            const publicacionRifas = await PUBLICACION_RIFAS.findAll({
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'descripcion', 'estado']
                    },
                    {
                        model: RIFAS,
                        as: 'rifa',
                        attributes: ['idRifa', 'nombreRifa', 'descripcion', 'estado']
                    }
                ]
            });
            return res.status(200).json(publicacionRifas);
        } catch (error) {
            console.error('Error al recuperar las publicaciones de rifas:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // Obtener todas las publicaciones de rifas activas
    async findActive(req, res) {
        try {
            const publicacionRifas = await PUBLICACION_RIFAS.findAll({
                where: { estado: 1 },
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'descripcion', 'estado']
                    },
                    {
                        model: RIFAS,
                        as: 'rifa',
                        attributes: ['idRifa', 'nombreRifa', 'descripcion', 'estado']
                    }
                ]
            });
            return res.status(200).json(publicacionRifas);
        } catch (error) {
            console.error('Error al listar las publicaciones de rifas activas:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar las publicaciones de rifas activas.'
            });
        }
    },

    // Obtener todas las publicaciones de rifas inactivas
    async findInactive(req, res) {
        try {
            const publicacionRifas = await PUBLICACION_RIFAS.findAll({
                where: { estado: 0 },
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'descripcion', 'estado']
                    },
                    {
                        model: RIFAS,
                        as: 'rifa',
                        attributes: ['idRifa', 'nombreRifa', 'descripcion', 'estado']
                    }
                ]
            });
            return res.status(200).json(publicacionRifas);
        } catch (error) {
            console.error('Error al listar las publicaciones de rifas inactivas:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar las publicaciones de rifas inactivas.'
            });
        }
    },

    // Obtener una publicación de rifa por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const publicacionRifa = await PUBLICACION_RIFAS.findByPk(id, {
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'descripcion', 'estado']
                    },
                    {
                        model: RIFAS,
                        as: 'rifa',
                        attributes: ['idRifa', 'nombreRifa', 'descripcion', 'estado']
                    }
                ]
            });

            if (!publicacionRifa) {
                return res.status(404).json({ message: 'Publicación de rifa no encontrada' });
            }

            return res.status(200).json(publicacionRifa);
        } catch (error) {
            console.error(`Error al buscar la publicación de rifa con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar la publicación de rifa.'
            });
        }
    },

    // Crear una nueva publicación de rifa
    async create(req, res) {
        const { foto, idPublicacion, idRifa } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1;

        if (!foto || !idPublicacion || !idRifa) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            // Verificar si la publicación existe
            const publicacionExistente = await PUBLICACIONES.findByPk(idPublicacion);
            if (!publicacionExistente) {
                return res.status(400).json({ message: 'La publicación especificada no existe.' });
            }

            // Verificar si la rifa existe
            const rifaExistente = await RIFAS.findByPk(idRifa);
            if (!rifaExistente) {
                return res.status(400).json({ message: 'La rifa especificada no existe.' });
            }

            const nuevaPublicacionRifa = {
                foto,
                estado,
                idPublicacion,
                idRifa
            };

            const publicacionRifaCreada = await PUBLICACION_RIFAS.create(nuevaPublicacionRifa);
            return res.status(201).json({
                message: 'Publicación de rifa creada con éxito',
                createdPublicacionRifa: publicacionRifaCreada
            });
        } catch (error) {
            console.error('Error al crear la publicación de rifa:', error);
            return res.status(500).json({
                message: error.message || 'Error al crear la publicación de rifa.'
            });
        }
    },

    // Actualizar una publicación de rifa existente
    async update(req, res) {
        const { foto, estado, idPublicacion, idRifa } = req.body;
        const id = req.params.id;

        const camposActualizados = {};

        if (foto !== undefined) camposActualizados.foto = foto;
        if (estado !== undefined) camposActualizados.estado = estado;

        if (idPublicacion !== undefined) {
            const publicacionExistente = await PUBLICACIONES.findByPk(idPublicacion);
            if (!publicacionExistente) {
                return res.status(400).json({ message: 'La publicación especificada no existe.' });
            }
            camposActualizados.idPublicacion = idPublicacion;
        }

        if (idRifa !== undefined) {
            const rifaExistente = await RIFAS.findByPk(idRifa);
            if (!rifaExistente) {
                return res.status(400).json({ message: 'La rifa especificada no existe.' });
            }
            camposActualizados.idRifa = idRifa;
        }

        try {
            const [rowsUpdated] = await PUBLICACION_RIFAS.update(camposActualizados, {
                where: { idPublicacionRifa: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Publicación de rifa no encontrada' });
            }

            const publicacionRifaActualizada = await PUBLICACION_RIFAS.findByPk(id, {
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'descripcion', 'estado']
                    },
                    {
                        model: RIFAS,
                        as: 'rifa',
                        attributes: ['idRifa', 'nombreRifa', 'descripcion', 'estado']
                    }
                ]
            });

            return res.status(200).json({
                message: `La publicación de rifa con ID: ${id} ha sido actualizada`,
                updatedPublicacionRifa: publicacionRifaActualizada
            });
        } catch (error) {
            console.error(`Error al actualizar la publicación de rifa con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar la publicación de rifa' });
        }
    },

    // Eliminar una publicación de rifa
    async delete(req, res) {
        const id = req.params.id;

        try {
            const publicacionRifa = await PUBLICACION_RIFAS.findByPk(id);

            if (!publicacionRifa) {
                return res.status(404).json({ error: 'Publicación de rifa no encontrada' });
            }

            await publicacionRifa.destroy();
            return res.status(200).json({ message: 'Publicación de rifa eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar la publicación de rifa:', error);
            return res.status(500).json({ error: 'Error al eliminar la publicación de rifa' });
        }
    }
};
