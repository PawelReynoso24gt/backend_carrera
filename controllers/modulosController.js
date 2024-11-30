'use strict';

const db = require('../models');
const MODULOS = db.modulos;
const PERMISOS = db.permisos;

module.exports = {
    // * Listar todos los módulos con sus permisos asociados
    async findAll(req, res) {
        try {
            const modulos = await MODULOS.findAll({
                include: [{
                    model: PERMISOS,
                    as: 'permisos',
                    attributes: ['idPermiso', 'nombrePermiso'] // Selecciona los campos relevantes
                }]
            });

            return res.status(200).json(modulos);
        } catch (error) {
            return res.status(500).json({
                message: error.message || 'Error al listar los módulos.'
            });
        }
    },

    // * Buscar módulo por ID
    async findById(req, res) {
        const { idModulo } = req.params;

        try {
            const modulo = await MODULOS.findByPk(idModulo, {
                include: [{
                    model: PERMISOS,
                    as: 'permisos',
                    attributes: ['idPermiso', 'nombrePermiso']
                }]
            });

            if (!modulo) {
                return res.status(404).json({ message: 'Módulo no encontrado.' });
            }

            return res.status(200).json(modulo);
        } catch (error) {
            return res.status(500).json({
                message: error.message || 'Error al buscar el módulo.'
            });
        }
    },

    // * Buscar módulo por nombre
    async findByName(req, res) {
        const { nombreModulo } = req.params;

        if (!nombreModulo) {
            return res.status(400).json({ message: 'El parámetro nombreModulo es requerido.' });
        }

        try {
            const modulo = await MODULOS.findOne({
                where: { nombreModulo },
                include: [{
                    model: PERMISOS,
                    as: 'permisos',
                    attributes: ['idPermiso', 'nombrePermiso']
                }]
            });

            if (!modulo) {
                return res.status(404).json({ message: 'Módulo no encontrado.' });
            }

            return res.status(200).json(modulo);
        } catch (error) {
            return res.status(500).json({
                message: error.message || 'Error al buscar el módulo por nombre.'
            });
        }
    },

    // * Crear un nuevo módulo
    async create(req, res) {
        const { nombreModulo, descripcion } = req.body;

        if (!nombreModulo) {
            return res.status(400).json({ message: 'Falta el campo requerido: nombreModulo.' });
        }

        try {
            const nuevoModulo = await MODULOS.create({
                nombreModulo,
                descripcion,
                estado: 1
            });

            return res.status(201).json(nuevoModulo);
        } catch (error) {
            return res.status(500).json({
                message: error.message || 'Error al crear el módulo.'
            });
        }
    },

    // * Actualizar un módulo
    async update(req, res) {
        const { idModulo } = req.params;
        const { nombreModulo, descripcion, estado } = req.body;

        const camposActualizados = {};
        if (nombreModulo !== undefined) camposActualizados.nombreModulo = nombreModulo;
        if (descripcion !== undefined) camposActualizados.descripcion = descripcion;
        if (estado !== undefined) camposActualizados.estado = estado;

        try {
            const [rowsUpdated] = await MODULOS.update(camposActualizados, {
                where: { idModulo }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Módulo no encontrado.' });
            }

            return res.status(200).json({ message: 'Módulo actualizado con éxito.' });
        } catch (error) {
            return res.status(500).json({
                message: error.message || 'Error al actualizar el módulo.'
            });
        }
    },

    // * Eliminar un módulo
    async delete(req, res) {
        const { idModulo } = req.params;

        try {
            const deleted = await MODULOS.destroy({
                where: { idModulo }
            });

            if (deleted === 0) {
                return res.status(404).json({ message: 'Módulo no encontrado.' });
            }

            return res.status(200).json({ message: 'Módulo eliminado con éxito.' });
        } catch (error) {
            return res.status(500).json({
                message: error.message || 'Error al eliminar el módulo.'
            });
        }
    }
};
