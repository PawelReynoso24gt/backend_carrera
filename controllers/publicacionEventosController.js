'use strict';
const db = require("../models");
const PUBLICACION_EVENTOS = db.publicacion_eventos;
const PUBLICACIONES = db.publicaciones;
const EVENTOS = db.eventos;

module.exports = {
    // Obtener todas las publicaciones de eventos
    async find(req, res) {
        try {
            const publicacionesEventos = await PUBLICACION_EVENTOS.findAll({
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'descripcion']
                    },
                    {
                        model: EVENTOS,
                        as: 'evento',
                        attributes: ['idEvento', 'nombreEvento', 'fechaHoraInicio', 'fechaHoraFin', 'descripcion']
                    }
                ]
            });
            return res.status(200).json(publicacionesEventos);
        } catch (error) {
            console.error('Error al recuperar las publicaciones de eventos:', error);
            return res.status(500).json({ message: 'Error al recuperar las publicaciones de eventos.' });
        }
    },

    // Obtener publicaciones de eventos activas
    async findActive(req, res) {
        try {
            const publicacionesEventos = await PUBLICACION_EVENTOS.findAll({
                where: { estado: 1 },
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'descripcion']
                    },
                    {
                        model: EVENTOS,
                        as: 'evento',
                        attributes: ['idEvento', 'nombreEvento', 'fechaHoraInicio', 'fechaHoraFin', 'descripcion']
                    }
                ]
            });
            return res.status(200).json(publicacionesEventos);
        } catch (error) {
            console.error('Error al listar las publicaciones de eventos activas:', error);
            return res.status(500).json({ message: 'Error al listar las publicaciones de eventos activas.' });
        }
    },

    // Obtener publicaciones de eventos inactivas
    async findInactive(req, res) {
        try {
            const publicacionesEventos = await PUBLICACION_EVENTOS.findAll({
                where: { estado: 0 },
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'descripcion']
                    },
                    {
                        model: EVENTOS,
                        as: 'evento',
                        attributes: ['idEvento', 'nombreEvento', 'fechaHoraInicio', 'fechaHoraFin', 'descripcion']
                    }
                ]
            });
            return res.status(200).json(publicacionesEventos);
        } catch (error) {
            console.error('Error al listar las publicaciones de eventos inactivas:', error);
            return res.status(500).json({ message: 'Error al listar las publicaciones de eventos inactivas.' });
        }
    },

    // Obtener una publicación de evento por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const publicacionEvento = await PUBLICACION_EVENTOS.findByPk(id, {
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'descripcion']
                    },
                    {
                        model: EVENTOS,
                        as: 'evento',
                        attributes: ['idEvento', 'nombreEvento', 'fechaHoraInicio', 'fechaHoraFin', 'descripcion']
                    }
                ]
            });

            if (!publicacionEvento) {
                return res.status(404).json({ message: 'Publicación de evento no encontrada.' });
            }

            return res.status(200).json(publicacionEvento);
        } catch (error) {
            console.error(`Error al buscar la publicación de evento con ID ${id}:`, error);
            return res.status(500).json({ message: 'Error al buscar la publicación de evento.' });
        }
    },

    // Crear una nueva publicación de evento
    async create(req, res) {
        const { foto, idPublicacion, idEvento } = req.body;
        const estado = req.body.estado !== undefined ? req.body.estado : 1;

        if (!foto || !idPublicacion || !idEvento) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        try {
            // Validar existencia de relaciones
            const publicacionExistente = await PUBLICACIONES.findByPk(idPublicacion);
            if (!publicacionExistente) {
                return res.status(400).json({ message: 'La publicación especificada no existe.' });
            }

            const eventoExistente = await EVENTOS.findByPk(idEvento);
            if (!eventoExistente) {
                return res.status(400).json({ message: 'El evento especificado no existe.' });
            }

            const nuevaPublicacionEvento = {
                foto,
                estado,
                idPublicacion,
                idEvento
            };

            const publicacionEventoCreada = await PUBLICACION_EVENTOS.create(nuevaPublicacionEvento);
            return res.status(201).json({
                message: 'Publicación de evento creada con éxito',
                createdPublicacionEvento: publicacionEventoCreada
            });
        } catch (error) {
            console.error('Error al crear la publicación de evento:', error);
            return res.status(500).json({ message: 'Error al crear la publicación de evento.' });
        }
    },

    // Actualizar una publicación de evento
    async update(req, res) {
        const { foto, estado, idPublicacion, idEvento } = req.body;
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

        if (idEvento !== undefined) {
            const eventoExistente = await EVENTOS.findByPk(idEvento);
            if (!eventoExistente) {
                return res.status(400).json({ message: 'El evento especificado no existe.' });
            }
            camposActualizados.idEvento = idEvento;
        }

        try {
            const [rowsUpdated] = await PUBLICACION_EVENTOS.update(camposActualizados, {
                where: { idPublicacionEvento: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Publicación de evento no encontrada.' });
            }

            const publicacionEventoActualizada = await PUBLICACION_EVENTOS.findByPk(id, {
                include: [
                    {
                        model: PUBLICACIONES,
                        as: 'publicacion',
                        attributes: ['idPublicacion', 'nombrePublicacion', 'descripcion']
                    },
                    {
                        model: EVENTOS,
                        as: 'evento',
                        attributes: ['idEvento', 'nombreEvento', 'fechaHoraInicio', 'fechaHoraFin', 'descripcion']
                    }
                ]
            });

            return res.status(200).json({
                message: 'Publicación de evento actualizada con éxito',
                updatedPublicacionEvento: publicacionEventoActualizada
            });
        } catch (error) {
            console.error(`Error al actualizar la publicación de evento con ID ${id}:`, error);
            return res.status(500).json({ message: 'Error al actualizar la publicación de evento.' });
        }
    },

    // Eliminar una publicación de evento
    async delete(req, res) {
        const id = req.params.id;

        try {
            const publicacionEvento = await PUBLICACION_EVENTOS.findByPk(id);

            if (!publicacionEvento) {
                return res.status(404).json({ message: 'Publicación de evento no encontrada.' });
            }

            await publicacionEvento.destroy();
            return res.status(200).json({ message: 'Publicación de evento eliminada con éxito.' });
        } catch (error) {
            console.error('Error al eliminar la publicación de evento:', error);
            return res.status(500).json({ message: 'Error al eliminar la publicación de evento.' });
        }
    }
};
