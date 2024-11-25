// middlewares/authenticateToken.js
'use strict';
const jwt = require('jsonwebtoken');
const { usuarios: Usuarios } = require('../models'); // Asegúrate de que 'usuarios' sea el nombre correcto
const Sequelize = require('sequelize');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // Si no hay token, retorna 401 (Unauthorized)

    // Verificar si el token es válido en la base de datos
    Usuarios.findOne({
        where: {
            token: token,
            tokenExpiresAt: {
                [Sequelize.Op.gt]: new Date() // Verifica que el token no haya expirado
            }
        }
    })
    .then(usuario => {
        if (!usuario) return res.sendStatus(403); // Si el token no es válido, retorna 403 (Forbidden)

        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if (err) return res.sendStatus(403); // Si el token no es válido, retorna 403 (Forbidden)

            req.user = user; // Guardar la información del usuario en la request para usarla en las rutas
            next(); // Continuar con la siguiente función middleware o la ruta
        });
    })
    .catch(err => {
        console.error('Error al verificar el token:', err);
        return res.sendStatus(500); // Error interno del servidor
    });
}

// Cambiar la exportación para ser una función en lugar de un objeto
module.exports = authenticateToken;