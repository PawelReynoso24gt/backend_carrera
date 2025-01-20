'use strict';
const jwt = require('jsonwebtoken');
const { usuarios: Usuarios } = require('../models');
const Sequelize = require('sequelize');
const { Op } = Sequelize;

const PASSWORD_CHANGE_GRACE_PERIOD = 15; // Período de gracia en días

async function authenticateToken(req, res, next) {
    // Excluir ciertas rutas del middleware
    const excludedPaths = ['/publicaciones', '/productos', '/personas_image', '/fotos_sedes_image'];
    if (excludedPaths.some(path => req.path.startsWith(path))) {
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extraer el token del encabezado Authorization

    if (!token) {
        return res.status(401).send({ message: 'Token no proporcionado.' }); // Retorna 401 si no hay token
    }

    try {
        // Verificar si el token existe y no ha expirado en la base de datos
        const usuario = await Usuarios.findOne({
            where: {
                token: token,
                tokenExpiresAt: {
                    [Op.gt]: new Date() // Verificar que el token no ha expirado
                }
            }
        });

        if (!usuario) {
            return res.status(403).send({ message: 'Token inválido o expirado.' }); // Retorna 403 si el token no es válido
        }

        // Verificar si el período de gracia ha expirado usando passwordCreatedAt
        const now = new Date();
        const passwordExpirationDate = new Date(usuario.passwordCreatedAt);
        passwordExpirationDate.setDate(passwordExpirationDate.getDate() + PASSWORD_CHANGE_GRACE_PERIOD);

        if (now > passwordExpirationDate && usuario.changedPassword === 0) {
            return res.status(403).send({ message: 'Debe cambiar su contraseña. Su cuenta está bloqueada hasta que lo haga.' });
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

    } catch (err) {
        console.error('Error al verificar el token en la base de datos:', err);
        return res.status(500).send({ message: 'Error interno del servidor.' }); // Retorna 500 en caso de error interno
    }
}

module.exports = authenticateToken;
