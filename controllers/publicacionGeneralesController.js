'use strict';
const db = require("../models");
const PUBLICACION_GENERALES = db.publicacion_generales;
const PUBLICACIONES = db.publicaciones;

module.exports = {
    // Obtener todas las publicaciones generales
    async find(req, res) {
        try {
            const publicacionesGenerales = await PUBLICACION_GENERALES.findAll({
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'fechaPublicacion', 'descripcion']
                    }
                ]
            });
            return res.status(200).json(publicacionesGenerales);
        } catch (error) {
            console.error('Error al recuperar las publicaciones generales:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // Obtener todas las publicaciones generales activas
    async findActive(req, res) {
        try {
            const publicacionesGenerales = await PUBLICACION_GENERALES.findAll({
                where: {
                    estado: 1
                },
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'fechaPublicacion', 'descripcion']
                    }
                ]
            });
            return res.status(200).json(publicacionesGenerales);
        } catch (error) {
            console.error('Error al listar las publicaciones generales activas:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar las publicaciones generales activas.'
            });
        }
    },

    // Obtener todas las publicaciones generales inactivas
    async findInactive(req, res) {
        try {
            const publicacionesGenerales = await PUBLICACION_GENERALES.findAll({
                where: {
                    estado: 0
                },
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'fechaPublicacion', 'descripcion']
                    }
                ]
            });
            return res.status(200).json(publicacionesGenerales);
        } catch (error) {
            console.error('Error al listar las publicaciones generales inactivas:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar las publicaciones generales inactivas.'
            });
        }
    },

    // Obtener publicación general por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const publicacionGeneral = await PUBLICACION_GENERALES.findByPk(id, {
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'fechaPublicacion', 'descripcion']
                    }
                ]
            });

            if (!publicacionGeneral) {
                return res.status(404).json({ message: 'Publicación general no encontrada' });
            }

            return res.status(200).json(publicacionGeneral);
        } catch (error) {
            console.error(`Error al buscar la publicación general con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar la publicación general.'
            });
        }
    },

    // Crear una nueva publicación general
    async create(req, res) {
        const { foto, idPublicacion } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1;
        
        if (!foto || !idPublicacion) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            // Verificar si la publicación existe
            const publicacionExistente = await PUBLICACIONES.findByPk(idPublicacion);
            if (!publicacionExistente) {
                return res.status(400).json({ message: 'El idPublicacion proporcionado no existe.' });
            }

            const nuevaPublicacionGeneral = {
                foto,
                estado,
                idPublicacion
            };

            const publicacionGeneralCreada = await PUBLICACION_GENERALES.create(nuevaPublicacionGeneral);
            return res.status(201).json({
                message: 'Publicación general creada con éxito',
                createdPublicacionGeneral: publicacionGeneralCreada
            });
        } catch (error) {
            console.error('Error al insertar la publicación general:', error);
            return res.status(500).json({ error: 'Error al insertar la publicación general' });
        }
    },

    // Actualizar una publicación general existente
    async update(req, res) {
        const { foto, estado, idPublicacion } = req.body;
        const id = req.params.id;

        const camposActualizados = {};

        if (foto !== undefined) camposActualizados.foto = foto;
        if (estado !== undefined) {
            if (![0, 1].includes(estado)) {
                return res.status(400).json({ message: 'El estado debe ser 0 (inactivo) o 1 (activo).' });
            }
            camposActualizados.estado = estado;
        }
        if (idPublicacion !== undefined) {
            const publicacionExistente = await PUBLICACIONES.findByPk(idPublicacion);
            if (!publicacionExistente) {
                return res.status(400).json({ message: 'El idPublicacion proporcionado no existe.' });
            }
            camposActualizados.idPublicacion = idPublicacion;
        }

        try {
            const [rowsUpdated] = await PUBLICACION_GENERALES.update(
                camposActualizados,
                {
                    where: { idPublicacionGeneral: id }
                }
            );

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Publicación general no encontrada' });
            }

            const publicacionGeneralActualizada = await PUBLICACION_GENERALES.findByPk(id, {
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'fechaPublicacion', 'descripcion']
                    }
                ]
            });

            return res.status(200).json({
                message: `La publicación general con ID: ${id} ha sido actualizada`,
                updatedPublicacionGeneral: publicacionGeneralActualizada
            });
        } catch (error) {
            console.error(`Error al actualizar la publicación general con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar la publicación general' });
        }
    },

    // Eliminar una publicación general
    async delete(req, res) {
        const id = req.params.id;

        try {
            const publicacionGeneral = await PUBLICACION_GENERALES.findByPk(id);

            if (!publicacionGeneral) {
                return res.status(404).json({ error: 'Publicación general no encontrada' });
            }

            await publicacionGeneral.destroy();
            return res.status(200).json({ message: 'Publicación general eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar la publicación general:', error);
            return res.status(500).json({ error: 'Error al eliminar la publicación general' });
        }
    }
};
