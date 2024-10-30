// ! Controlador de usuarios
'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const USUARIOS = db.usuarios;

module.exports = {

    // * Listar todos los usuarios activos
    async find_active_users(req, res) {
        return USUARIOS.findAll({
            where: {
                estado: 1 // Se filtran por estado para saber si estan activos
            }
        })
        .then((usuarios) => {
            res.status(200).send(usuarios);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los usuarios.'
            });
        });
    }
};