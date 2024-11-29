'use strict';

const db = require('../models');
const PERMISOS = db.permisos;
const MODULOS = db.modulos;

module.exports = {

    // * Listar todos los permisos con su módulo asociado
    async findAll(req, res) {
        try {
            const permisos = await PERMISOS.findAll({
                include: [{
                    model: MODULOS,
                    attributes: ['idModulo', 'nombreModulo'] // Selecciona los campos relevantes
                }]
            });

            return res.status(200).json(permisos);
        } catch (error) {
            return res.status(500).json({
                message: error.message || 'Error al listar los permisos.'
            });
        }
    },

    // * Buscar permiso por ID
    async findById(req, res) {
        const { idPermiso } = req.params;

        try {
            const permiso = await PERMISOS.findByPk(idPermiso, {
                include: [{
                    model: MODULOS,
                    attributes: ['idModulo', 'nombreModulo']
                }]
            });

            if (!permiso) {
                return res.status(404).json({ message: 'Permiso no encontrado.' });
            }

            return res.status(200).json(permiso);
        } catch (error) {
            return res.status(500).json({
                message: error.message || 'Error al buscar el permiso.'
            });
        }
    },

    // * Buscar permisos por módulo
    async findByModulo(req, res) {
        const { idModulo } = req.params;

        try {
            const modulo = await MODULOS.findByPk(idModulo);

            if (!modulo) {
                return res.status(404).json({ message: 'Módulo no encontrado.' });
            }

            const permisos = await PERMISOS.findAll({
                where: { idModulo },
                include: [{
                    model: MODULOS,
                    attributes: ['idModulo', 'nombreModulo']
                }]
            });

            return res.status(200).json(permisos);
        } catch (error) {
            return res.status(500).json({
                message: error.message || 'Error al buscar los permisos del módulo.'
            });
        }
    },

    // * Crear un nuevo permiso asociado a un módulo
    async create(req, res) {
        const { nombrePermiso, descripcion, idModulo } = req.body;

        if (!nombrePermiso || !idModulo) {
            return res.status(400).json({
                message: 'Faltan campos requeridos: nombrePermiso y/o idModulo.'
            });
        }

        try {
            const modulo = await MODULOS.findByPk(idModulo);
            if (!modulo) {
                return res.status(404).json({ message: 'Módulo no encontrado.' });
            }

            const nuevoPermiso = await PERMISOS.create({
                nombrePermiso,
                descripcion,
                estado: 1,
                idModulo
            });

            return res.status(201).json(nuevoPermiso);
        } catch (error) {
            return res.status(500).json({
                message: error.message || 'Error al crear el permiso.'
            });
        }
    },

    // * Actualizar un permiso
    async update(req, res) {
        const { idPermiso } = req.params;
        const { nombrePermiso, descripcion, estado, idModulo } = req.body;

        const camposActualizados = {};
        if (nombrePermiso !== undefined) camposActualizados.nombrePermiso = nombrePermiso;
        if (descripcion !== undefined) camposActualizados.descripcion = descripcion;
        if (estado !== undefined) camposActualizados.estado = estado;
        if (idModulo !== undefined) camposActualizados.idModulo = idModulo;

        try {
            if (idModulo !== undefined) {
                const modulo = await MODULOS.findByPk(idModulo);
                if (!modulo) {
                    return res.status(404).json({ message: 'Módulo no encontrado.' });
                }
            }

            const [rowsUpdated] = await PERMISOS.update(camposActualizados, {
                where: { idPermiso }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Permiso no encontrado.' });
            }

            return res.status(200).json({ message: 'Permiso actualizado con éxito.' });
        } catch (error) {
            return res.status(500).json({
                message: error.message || 'Error al actualizar el permiso.'
            });
        }
    },

    // * Eliminar un permiso
    async delete(req, res) {
        const { idPermiso } = req.params;

        try {
            const deleted = await PERMISOS.destroy({
                where: { idPermiso }
            });

            if (deleted === 0) {
                return res.status(404).json({ message: 'Permiso no encontrado.' });
            }

            return res.status(200).json({ message: 'Permiso eliminado con éxito.' });
        } catch (error) {
            return res.status(500).json({
                message: error.message || 'Error al eliminar el permiso.'
            });
        }
    }
};
