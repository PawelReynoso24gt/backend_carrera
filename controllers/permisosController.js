'use strict';

const db = require('../models');
const PERMISOS = db.permisos;

module.exports = {

    // * Listar todos los permisos
    async findAll(req, res) {
        return PERMISOS.findAll()
            .then((permisos) => {
                res.status(200).send(permisos);
            })
            .catch((error) => {
                res.status(500).send({
                    message: error.message || 'Error al listar los permisos.'
                });
            });
    },

    // * Crear un nuevo permiso
    async create(req, res) {
        const { nombrePermiso, descripcion } = req.body;

        if (!nombrePermiso) {
            return res.status(400).json({ message: 'Falta el campo requerido: nombrePermiso.' });
        }

        try {
            const nuevoPermiso = await PERMISOS.create({
                nombrePermiso,
                descripcion,
                estado: 1
            });

            return res.status(201).json(nuevoPermiso);
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Error al crear el permiso.'
            });
        }
    },

    // * Actualizar un permiso
    async update(req, res) {
        const { idPermiso } = req.params;
        const { nombrePermiso, descripcion, estado } = req.body;

        const camposActualizados = {};
        if (nombrePermiso !== undefined) camposActualizados.nombrePermiso = nombrePermiso;
        if (descripcion !== undefined) camposActualizados.descripcion = descripcion;
        if (estado !== undefined) camposActualizados.estado = estado;

        try {
            const [rowsUpdated] = await PERMISOS.update(camposActualizados, {
                where: { idPermiso }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Permiso no encontrado.' });
            }

            return res.status(200).json({ message: 'Permiso actualizado con éxito.' });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Error al actualizar el permiso.'
            });
        }
    },

    // * Eliminar un permiso
    async delete(req, res) {
        const { idPermiso } = req.params;

        return PERMISOS.destroy({
            where: { idPermiso }
        })
        .then((deleted) => {
            if (deleted === 0) {
                return res.status(404).send({ message: 'Permiso no encontrado.' });
            }
            res.status(200).send({ message: 'Permiso eliminado con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al eliminar el permiso.'
            });
        });
    }
};
