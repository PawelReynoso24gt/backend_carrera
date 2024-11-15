'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const TRASLADOS = db.Traslado;
const TIPO_TRASLADOS = db.TipoTraslado;

module.exports = {

    // * Listar todos los traslados con el tipo de traslado
    async findAll(req, res) {
        return TRASLADOS.findAll({
            include: [{
                model: TIPO_TRASLADOS,
                as: 'tipoTraslado',
                attributes: ['tipo']
            }]
        })
        .then((traslados) => {
            res.status(200).send(traslados);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los traslados.'
            });
        });
    },

    // * Listar todos los traslados activos
    async findActive(req, res) {
        return TRASLADOS.findAll({
            where: {
                estado: 1
            },
            include: [{
                model: TIPO_TRASLADOS,
                as: 'tipoTraslado',
                attributes: ['tipo']
            }]
        })
        .then((traslados) => {
            res.status(200).send(traslados);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los traslados activos.'
            });
        });
    },

    // * Listar todos los traslados inactivos
    async findInactive(req, res) {
        return TRASLADOS.findAll({
            where: {
                estado: 0 
            }
        })
        .then((traslados) => {
            res.status(200).send(traslados);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los traslados inactivos.'
            });
        });
    },


    // * Crear un nuevo traslado
    async create(req, res) {
        const { fecha, descripcion, idTipoTraslado } = req.body;
 
        if (!fecha) {
            return res.status(400).json({ message: 'Falta el campo requerido: fecha.' });
        }
        if (!descripcion) {
            return res.status(400).json({ message: 'Falta el campo requerido: descripcion.' });
        }
        if (!idTipoTraslado) {
            return res.status(400).json({ message: 'Falta el campo requerido: idTipoTraslado.' });
        }
    
        const regexDescripcion = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,-]+$/;
        if (!regexDescripcion.test(descripcion)) {
            return res.status(400).json({ message: 'La descripción solo debe contener letras, números, espacios y los signos permitidos (.,-).' });
        }
    
        try {

            const tipoTrasladoExistente = await TIPO_TRASLADOS.findByPk(idTipoTraslado);
            if (!tipoTrasladoExistente) {
                return res.status(400).json({ message: 'El idTipoTraslado proporcionado no existe.' });
            }

            const datosIngreso = {
                fecha,
                descripcion,
                estado: 1, 
                idTipoTraslado
            };
    
            const trasladoCreado = await TRASLADOS.create(datosIngreso);
            return res.status(201).json(trasladoCreado);
    
        } catch (error) {
            console.error('Error al crear el traslado:', error);
            return res.status(500).json({
                message: error.message || 'Error al crear el traslado.'
            });
        }
    },
    

    // * Actualizar un traslado
    async update(req, res) {
        const { fecha, descripcion, idTipoTraslado, estado } = req.body;
        const idTraslado = req.params.id;
    
        const camposActualizados = {};

        if (fecha !== undefined) {
            camposActualizados.fecha = fecha;
        }
    
        if (descripcion !== undefined) {
            const regexDescripcion = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,-]+$/;
            if (!regexDescripcion.test(descripcion)) {
                return res.status(400).json({ message: 'La descripción solo debe contener letras, números, espacios y los signos permitidos (.,-).' });
            }
            camposActualizados.descripcion = descripcion;
        }
    
        if (idTipoTraslado !== undefined) {
                const tipoTrasladoExistente = await TIPO_TRASLADOS.findByPk(idTipoTraslado);
            if (!tipoTrasladoExistente) {
                return res.status(400).json({ message: 'El idTipoTraslado proporcionado no existe.' });
            }
            camposActualizados.idTipoTraslado = idTipoTraslado;
        }
    
        if (estado !== undefined) {
            camposActualizados.estado = estado;
        }
    
        try {
            // Actualización del traslado
            const [rowsUpdated] = await TRASLADOS.update(camposActualizados, {
                where: { idTraslado }
            });
    
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Traslado no encontrado.' });
            }
    
            return res.status(200).json({ message: 'Traslado actualizado con éxito.' });
    
        } catch (error) {
            console.error(`Error al actualizar el traslado con ID ${idTraslado}:`, error);
            return res.status(500).json({ error: 'Error al actualizar el traslado.' });
        }
    },
    
    
    // * Buscar un traslado por descripción
    async findTraslado(req, res) {
        const { descripcion } = req.params;

        return TRASLADOS.findOne({
            where: {
                descripcion: {
                    [Sequelize.Op.like]: `%${descripcion}%`
                }
            },
            include: [{
                model: TIPO_TRASLADOS,
                as: 'tipoTraslado',
                attributes: ['tipo']
            }]
        })
        .then((traslado) => {
            if (!traslado) {
                return res.status(404).send({ message: 'Traslado no encontrado.' });
            }
            res.status(200).send(traslado);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar el traslado.'
            });
        });
    },

     // * Buscar un traslado por ID
     async findById(req, res) {
        const { idTraslado } = req.params;

        return TRASLADOS.findByPk(idTraslado, {
            include: [{
                model: TIPO_TRASLADOS,
                as: 'tipoTraslado',
                attributes: ['tipo']
            }]
        })
        .then((traslado) => {
            if (!traslado) {
                return res.status(404).send({ message: 'Traslado no encontrado.' });
            }
            res.status(200).send(traslado);
        })
        .catch((error) => {
            console.error('Error al buscar el traslado por ID:', error);
            res.status(500).send({
                message: error.message || 'Error al buscar el traslado por ID.'
            });
        });
    },

    // * Eliminar un traslado
    async delete(req, res) {
        const { idTraslado } = req.params;

        return TRASLADOS.destroy({
            where: { idTraslado }
        })
        .then((affectedRows) => {
            if (affectedRows === 0) {
                return res.status(404).send({ message: 'Traslado no encontrado.' });
            }
            res.status(200).send({ message: 'Traslado eliminado con éxito.' });
        })
        .catch((error) => {
            console.error('Error al eliminar el traslado:', error);
            res.status(500).send({
                message: error.message || 'Error al eliminar el traslado.'
            });
        });
    }
};
