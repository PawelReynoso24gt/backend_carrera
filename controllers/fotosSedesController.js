// ! Controlador de fotos_sedes
'use strict';
const Sequelize = require('sequelize');
const db = require('../models');
const FotosSedes = db.fotos_sedes;

module.exports = {
    // * Get fotos de sedes activas
    async find(req, res) {
        try {
            const fotos = await FotosSedes.findAll({
                where: {
                    estado: 1 // Filtrar por estado 1
                },
                include: ['sede']
            });
            return res.status(200).send(fotos);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * Get todas las fotos de sedes
    async find_all(req, res) {
        try {
            const fotos = await FotosSedes.findAll({
                include: ['sede']
            });
            return res.status(200).send(fotos);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * Get foto de sede por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const foto = await FotosSedes.findByPk(id, {
                include: ['sede']
            });
            if (!foto) {
                return res.status(404).send({
                    message: 'Foto de sede no encontrada.'
                });
            }
            return res.status(200).send(foto);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al intentar recuperar el registro.'
            });
        }
    },

    // * Crear foto de sede
    async create(req, res) {
        const datos = req.body;
        const datos_ingreso = {
            foto: datos.foto,
            estado: 1,
            idSede: datos.idSede
        };

        try {
            const newFoto = await FotosSedes.create(datos_ingreso);
            return res.status(201).send(newFoto);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al insertar foto de sede' });
        }
    },

    // * Actualizar foto de sede
    async update(req, res) {
        const datos = req.body;
        const id = req.params.id;

        const camposActualizados = {};

        if (datos.foto !== undefined) camposActualizados.foto = datos.foto;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
        if (datos.idSede !== undefined) camposActualizados.idSede = datos.idSede;

        try {
            const [rowsUpdated] = await FotosSedes.update(camposActualizados, {
                where: { idFotoSede: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).send({ message: 'Foto de sede no encontrada' });
            }

            return res.status(200).send('La foto de sede ha sido actualizada');
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al actualizar foto de sede' });
        }
    },

    // * Eliminar foto de sede
    async delete(req, res) {
        const id = req.params.id;

        try {
            const foto = await FotosSedes.findByPk(id);
            if (!foto) {
                return res.status(404).json({ error: 'Foto de sede no encontrada' });
            }

            await foto.destroy();
            return res.json({ message: 'Foto de sede eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar foto de sede:', error);
            return res.status(500).json({ error: 'Error al eliminar foto de sede' });
        }
    }
};