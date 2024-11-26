'use strict';

const db = require('../models');
const ASIGNACION_PERMISOS = db.asignacion_permisos;
const ROLES = db.roles;
const PERMISOS = db.permisos;

module.exports = {

    // * Listar todas las asignaciones de permisos
    async findAll(req, res) {
        return ASIGNACION_PERMISOS.findAll({
            include: [
                {
                    model: ROLES,
                    as: 'rol',
                    attributes: ['nombreRol']
                },
                {
                    model: PERMISOS,
                    as: 'permiso',
                    attributes: ['nombrePermiso']
                }
            ]
        })
        .then((asignaciones) => {
            res.status(200).send(asignaciones);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las asignaciones de permisos.'
            });
        });
    },

    // * Crear una nueva asignación de permiso
    async create(req, res) {
        const { idRol, idPermiso } = req.body;

        if (!idRol || !idPermiso) {
            return res.status(400).json({ message: 'Faltan los campos requeridos: idRol y/o idPermiso.' });
        }

        try {
            const nuevaAsignacion = await ASIGNACION_PERMISOS.create({
                idRol,
                idPermiso,
                estado: 1
            });

            return res.status(201).json(nuevaAsignacion);
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Error al crear la asignación de permiso.'
            });
        }
    },

    // * Actualizar una asignación de permiso
    async update(req, res) {
        const { idAsignacion } = req.params;
        const { idRol, idPermiso, estado } = req.body;

        const camposActualizados = {};
        if (idRol !== undefined) camposActualizados.idRol = idRol;
        if (idPermiso !== undefined) camposActualizados.idPermiso = idPermiso;
        if (estado !== undefined) camposActualizados.estado = estado;

        try {
            const [rowsUpdated] = await ASIGNACION_PERMISOS.update(camposActualizados, {
                where: { idAsignacion }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Asignación de permiso no encontrada.' });
            }

            return res.status(200).json({ message: 'Asignación de permiso actualizada con éxito.' });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Error al actualizar la asignación de permiso.'
            });
        }
    },

    // * Eliminar una asignación de permiso
    async delete(req, res) {
        const { idAsignacion } = req.params;

        return ASIGNACION_PERMISOS.destroy({
            where: { idAsignacion }
        })
        .then((deleted) => {
            if (deleted === 0) {
                return res.status(404).send({ message: 'Asignación de permiso no encontrada.' });
            }
            res.status(200).send({ message: 'Asignación de permiso eliminada con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al eliminar la asignación de permiso.'
            });
        });
    }
};
