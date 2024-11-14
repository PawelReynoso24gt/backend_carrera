'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const PEDIDOS = db.pedidos;
const SEDES = db.sedes;
const USUARIOS = db.usuarios;

module.exports = {

    // * Listar todos los pedidos con su sede y usuario
    async findAll(req, res) {
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
    async findActive(req, res) {
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
     async findInactive(req, res) {
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
    
        // Validación: Verificar que los campos obligatorios estén presentes
        if (!fecha) {
            return res.status(400).json({ message: 'Falta el campo requerido: fecha.' });
        }
        if (!descripcion) {
            return res.status(400).json({ message: 'Falta el campo requerido: descripcion.' });
        }
        if (!idSede) {
            return res.status(400).json({ message: 'Falta el campo requerido: idSede.' });
        }
        if (!idUsuario) {
            return res.status(400).json({ message: 'Falta el campo requerido: idUsuario.' });
        }
    
        // Validación con expresión regular: La descripción solo debe contener letras, números y algunos signos permitidos
        const regexDescripcion = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,-]+$/;
        if (!regexDescripcion.test(descripcion)) {
            return res.status(400).json({ message: 'La descripción solo debe contener letras, números, espacios y los signos permitidos (.,-).' });
        }
    
        try {
            // Validación: Verificar si la sede y el usuario existen
            const sedeExistente = await SEDES.findByPk(idSede);
            if (!sedeExistente) {
                return res.status(400).json({ message: 'El idSede proporcionado no existe.' });
            }
    
            const usuarioExistente = await USUARIOS.findByPk(idUsuario);
            if (!usuarioExistente) {
                return res.status(400).json({ message: 'El idUsuario proporcionado no existe.' });
            }
    
            // Creación del nuevo pedido
            const pedidoCreado = await PEDIDOS.create({
                fecha,
                descripcion,
                estado: 1, // Activo por defecto
                idSede,
                idUsuario
            });
            return res.status(201).json(pedidoCreado);
    
        } catch (error) {
            console.error('Error al crear el pedido:', error);
            return res.status(500).json({
                message: error.message || 'Error al crear el pedido.'
            });
        }
    },
    

    // * Actualizar un pedido
    async update(req, res) {
        const { fecha, descripcion, idSede, idUsuario } = req.body;
        const idPedido = req.params.id;
    
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
    
        if (idSede !== undefined) {

            const sedeExistente = await SEDES.findByPk(idSede);
            if (!sedeExistente) {
                return res.status(400).json({ message: 'El idSede proporcionado no existe.' });
            }
            camposActualizados.idSede = idSede;
        }
    
        if (idUsuario !== undefined) {

            const usuarioExistente = await USUARIOS.findByPk(idUsuario);
            if (!usuarioExistente) {
                return res.status(400).json({ message: 'El idUsuario proporcionado no existe.' });
            }
            camposActualizados.idUsuario = idUsuario;
        }
    
        try {

            const [rowsUpdated] = await PEDIDOS.update(camposActualizados, {
                where: { idPedido }
            });
    
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Pedido no encontrado.' });
            }
    
            return res.status(200).json({ message: 'Pedido actualizado con éxito.' });
    
        } catch (error) {
            console.error(`Error al actualizar el pedido con ID ${idPedido}:`, error);
            return res.status(500).json({ error: 'Error al actualizar el pedido.' });
        }
    },
    


    // * Buscar un pedido por descripción
    async findPedido(req, res) {
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
       async findById(req, res) {
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
