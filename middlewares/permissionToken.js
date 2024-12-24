const { permisos, asignacion_permisos } = require('../models');
const jwt = require('jsonwebtoken');

function checkPermissions(requiredPermission) {
    return async (req, res, next) => {
        try {
            // Obtener el token del encabezado de autorización
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: 'Token no proporcionado.' });
            }

            // Decodificar el token para obtener el payload
            const decoded = jwt.decode(token);

            if (!decoded || !decoded.idRol) {
                return res.status(400).json({ message: 'Rol del usuario no encontrado en el token.' });
            }

            const { idRol } = decoded;

            // Consultar si el rol tiene el permiso requerido
            const hasPermission = await asignacion_permisos.findOne({
                include: {
                    model: permisos,
                    where: { nombrePermiso: requiredPermission },
                },
                where: { idRol, estado: 1 },
            });

            if (!hasPermission) {
                return res.status(403).json({ message: 'Acceso denegado: Permiso insuficiente.' });
            }

            next(); // Si el permiso es válido, continúa al controlador
        } catch (error) {
            console.error('Error al validar permisos:', error);
            res.status(500).json({ message: 'Error al validar permisos.' });
        }
    };
}

module.exports = { checkPermissions };
