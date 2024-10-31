'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const PEDIDOS = db.pedidos;
const SEDES = db.sedes;
const USUARIOS = db.usuarios;

module.exports = {

    // * Listar todos los pedidos con su sede y usuario
    async find_All(req, res) {
        return PEDIDOS.findAll({
            include: [
                {
                    model: SEDES,
                    as: 'sede',
                    attributes: ['nombreSede']
                },
                {
                    model: USUARIOS,
                    as: 'usuario',
                    attributes: ['usuario']
                }
            ]
        })
        .then((pedidos) => {
            res.status(200).send(pedidos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los pedidos.'
            });
        });
    },

    // * Listar todos los pedidos activos
    async find_active(req, res) {
        return PEDIDOS.findAll({
            where: {
                estado: 1
            },
            include: [
                {
                    model: SEDES,
                    as: 'sede',
                    attributes: ['nombreSede']
                },
                {
                    model: USUARIOS,
                    as: 'usuario',
                    attributes: ['usuario']
                }
            ]
        })
        .then((pedidos) => {
            res.status(200).send(pedidos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los pedidos activos.'
            });
        });
    },

     // * Listar todos los pedidos activos
     async find_inactive(req, res) {
        return PEDIDOS.findAll({
            where: {
                estado: 0
            },
            include: [
                {
                    model: SEDES,
                    as: 'sede',
                    attributes: ['nombreSede']
                },
                {
                    model: USUARIOS,
                    as: 'usuario',
                    attributes: ['usuario']
                }
            ]
        })
        .then((pedidos) => {
            res.status(200).send(pedidos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los pedidos inactivos.'
            });
        });
    },

    // * Crear un nuevo pedido
    async create(req, res) {
        const { fecha, descripcion, idSede, idUsuario } = req.body;

        return PEDIDOS.create({
            fecha,
            descripcion,
            estado: 1, // Activo por defecto
            idSede,
            idUsuario
        })
        .then((pedido) => {
            res.status(201).send(pedido);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al crear el pedido.'
            });
        });
    },

    // * Actualizar un pedido
    async update(req, res) {
        const { idPedido } = req.params;
        const { fecha, descripcion, idSede, idUsuario } = req.body;

        return PEDIDOS.update(
            { fecha, descripcion, idSede, idUsuario },
            { where: { idPedido } }
        )
        .then((affectedRows) => {
            if (affectedRows[0] === 0) {
                return res.status(404).send({ message: 'Pedido no encontrado.' });
            }
            res.status(200).send({ message: 'Pedido actualizado con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al actualizar el pedido.'
            });
        });
    },


    // * Buscar un pedido por descripción
    async find_pedido(req, res) {
        const { descripcion } = req.params;

        return PEDIDOS.findOne({
            where: {
                descripcion: {
                    [Sequelize.Op.like]: `%${descripcion}%`
                }
            },
            include: [
                {
                    model: SEDES,
                    as: 'sede',
                    attributes: ['nombreSede']
                },
                {
                    model: USUARIOS,
                    as: 'usuario',
                    attributes: ['usuario']
                }
            ]
        })
        .then((pedido) => {
            if (!pedido) {
                return res.status(404).send({ message: 'Pedido no encontrado.' });
            }
            res.status(200).send(pedido);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar el pedido.'
            });
        });
    },

       // * Buscar un pedido por ID
       async find_by_id(req, res) {
        const { idPedido } = req.params;

        return PEDIDOS.findByPk(idPedido, {
            include: [
                {
                    model: SEDES,
                    as: 'sede',
                    attributes: ['nombreSede']
                },
                {
                    model: USUARIOS,
                    as: 'usuario',
                    attributes: ['usuario']
                }
            ]
        })
        .then((pedido) => {
            if (!pedido) {
                return res.status(404).send({ message: 'Pedido no encontrado.' });
            }
            res.status(200).send(pedido);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar el pedido por ID.'
            });
        });
    },

    // * Eliminar un pedido por ID
    async delete(req, res) {
        const { idPedido } = req.params;

        return PEDIDOS.destroy({
            where: { idPedido }
        })
        .then((deleted) => {
            if (deleted === 0) {
                return res.status(404).send({ message: 'Pedido no encontrado.' });
            }
            res.status(200).send({ message: 'Pedido eliminado con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al eliminar el pedido.'
            });
        });
    }
};
