'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const TIPO_TRASLADOS = db.TipoTraslado;

module.exports = {

    // * Listar todos los tipos de traslados
    async findAll(req, res) {
        return TIPO_TRASLADOS.findAll()
        .then((tipoTraslados) => {
            res.status(200).send(tipoTraslados);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los tipos de traslados.'
            });
        });
    },

    // * Listar todos los tipos de traslados activos
    async findActive(req, res) {
        return TIPO_TRASLADOS.findAll({
            where: {
                estado: 1 
            }
        })
        .then((tipoTraslados) => {
            res.status(200).send(tipoTraslados);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los tipos de traslados activos.'
            });
        });
    },

    // * Listar todos los tipos de traslados inactivos
    async findInactive(req, res) {
        return TIPO_TRASLADOS.findAll({
            where: {
                estado: 0 
            }
        })
        .then((tipoTraslados) => {
            res.status(200).send(tipoTraslados);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los tipos de traslados inactivos.'
            });
        });
    },

    // * Crear un nuevo tipo de traslado
    async create(req, res) {
        const { tipo } = req.body;
    

        if (!tipo) {
            return res.status(400).json({ message: 'Falta el campo requerido: tipo.' });
        }

        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    
        if (!regex.test(tipo)) {
            return res.status(400).json({ message: 'El tipo de traslado solo debe contener letras y espacios.' });
        }
    
        try {
            const datos_ingreso = {
                tipo,
                estado: 1 
            };
    
            const tipoTrasladoCreado = await TIPO_TRASLADOS.create(datos_ingreso);
            return res.status(201).json(tipoTrasladoCreado);
    
        } catch (error) {
            console.error('Error al crear el tipo de traslado:', error);
            return res.status(500).json({
                message: error.message || 'Error al crear el tipo de traslado.'
            });
        }
    },


    

    // * Actualizar un tipo de traslado
   async update(req, res) {
    const { tipo, estado } = req.body;
    const idTipoTraslado = req.params.id;

    const camposActualizados = {};


    if (tipo !== undefined) {

        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

        if (!regex.test(tipo)) {
            return res.status(400).json({ message: 'El tipo de traslado solo debe contener letras y espacios.' });
        }

        camposActualizados.tipo = tipo;
    }

    if (estado !== undefined) {
        camposActualizados.estado = estado;
    }

    try {

        const [rowsUpdated] = await TIPO_TRASLADOS.update(camposActualizados, {
            where: { idTipoTraslado }
        });

        if (rowsUpdated === 0) {
            return res.status(404).json({ message: 'Tipo de traslado no encontrado.' });
        }

        return res.status(200).json({ message: 'Tipo de traslado actualizado con éxito.' });

    } catch (error) {
        console.error(`Error al actualizar el tipo de traslado con ID ${idTipoTraslado}:`, error);
        return res.status(500).json({ error: 'Error al actualizar el tipo de traslado.' });
    }
    },



    // * Buscar un tipo de traslado por nombre
    async findTipo(req, res) {
        const { tipo } = req.params;

        return TIPO_TRASLADOS.findOne({
            where: {
                tipo: {
                    [Sequelize.Op.like]: `%${tipo}%`
                }
            }
        })
        .then((tipoTraslado) => {
            if (!tipoTraslado) {
                return res.status(404).send({ message: 'Tipo de traslado no encontrado.' });
            }
            res.status(200).send(tipoTraslado);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar el tipo de traslado.'
            });
        });
    },

  // * Buscar un tipo de traslado por ID
async findById(req, res) {
    const { idTipoTraslado } = req.params;

    return TIPO_TRASLADOS.findByPk(idTipoTraslado)
    .then((tipoTraslado) => {
        if (!tipoTraslado) {
            return res.status(404).send({ message: 'Tipo de traslado no encontrado.' });
        }
        res.status(200).send(tipoTraslado);
    })
    .catch((error) => {
        console.error('Error al buscar el tipo de traslado por ID:', error); // Agrega este log
        res.status(500).send({
            message: error.message || 'Error al buscar el tipo de traslado por ID.'
        });
    });
},

    // * Eliminar un tipo de traslado por ID
    async delete(req, res) {
        const { idTipoTraslado } = req.params;

        return TIPO_TRASLADOS.destroy({
            where: { idTipoTraslado }
        })
        .then((deleted) => {
            if (deleted === 0) {
                return res.status(404).send({ message: 'Tipo de traslado no encontrado.' });
            }
            res.status(200).send({ message: 'Tipo de traslado eliminado con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al eliminar el tipo de traslado.'
            });
        });
    }
};
