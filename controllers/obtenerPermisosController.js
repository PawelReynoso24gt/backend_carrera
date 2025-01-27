const { permisos, asignacion_permisos } = require('../models');
const jwt = require('jsonwebtoken');

const getPermissionsForRole = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token no proporcionado.' });
        }

        const decoded = jwt.decode(token);

        if (!decoded || !decoded.idRol) {
            return res.status(400).json({ message: 'Rol no encontrado en el token.' });
        }

        const { idRol } = decoded;

        // Obtener todos los permisos asignados al rol
        const permisosAsignados = await asignacion_permisos.findAll({
            include: [
              {
                model: permisos,
                attributes: ['nombrePermiso'], // Solo trae lo necesario
              },
            ],
            where: { idRol, estado: 1 },
          });


          const permisosMap = permisosAsignados.reduce((acc, asignacion) => {
            if (asignacion.permiso && asignacion.permiso.nombrePermiso) {
              acc[asignacion.permiso.nombrePermiso] = true;
            }
            return acc;
          }, {});
          

        res.json({ permisos: permisosMap });
    } catch (error) {
        console.error('Error al obtener permisos:', error);
        res.status(500).json({ message: 'Error al obtener permisos.' });
    }
};

module.exports = { getPermissionsForRole };
