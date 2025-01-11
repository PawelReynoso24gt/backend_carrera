'use strict';
const jwt = require('jsonwebtoken');
const { usuarios: Usuarios } = require('../models');
const Sequelize = require('sequelize');

function authenticateToken(req, res, next) {

    // Excluir la ruta `/publicaciones` del middleware (esto para que se vean las fotos que trae)
    if (req.path.startsWith('/publicaciones')) {
        return next();
    }

    if (req.path.startsWith('/productos')) {
        return next();
    }

    if (req.path.startsWith('/personas_image')) {
        return next();
    }

    if (req.path.startsWith('/fotos_sedes_image')) {
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extraer el token del encabezado Authorization

    if (!token) {
        return res.status(401).send({ message: 'Token no proporcionado.' }); // Retorna 401 si no hay token
    }

    // Verificar si el token existe y no ha expirado en la base de datos
    Usuarios.findOne({
        where: {
            token: token,
            tokenExpiresAt: {
                [Sequelize.Op.gt]: new Date() // Verificar que el token no ha expirado
            }
        }
    })
        .then(usuario => {
            if (!usuario) {
                return res.status(403).send({ message: 'Token inválido o expirado.' }); // Retorna 403 si el token no es válido
            }

            // Verificar el token con la clave secreta
            jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
                if (err) {
                    console.error('Error al verificar el token:', err);
                    return res.status(403).send({ message: 'Token inválido o expirado.' });
                }

                // Adjuntar el `idUsuario` al request para usarlo en los controladores
                req.userId = decoded.idUsuario; // Extraer `idUsuario` del token decodificado
                next(); // Continuar al siguiente middleware o controlador
            });
        })
        .catch(err => {
            console.error('Error al verificar el token en la base de datos:', err);
            return res.status(500).send({ message: 'Error interno del servidor.' }); // Retorna 500 en caso de error interno
        });
}

module.exports = authenticateToken;
