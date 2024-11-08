// ! Controlador de usuarios
'use strict';
const Sequelize = require('sequelize');
const db = require('../models');
const Usuarios = db.usuarios;

// SHA256
function rot13(texto) {
    return texto.replace(/[a-zA-Z]/g, function(c) {
        return String.fromCharCode(
            (c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
        );
    });
}

module.exports = {
    // * Get usuarios activos
    async find(req, res) {
        try {
            const users = await Usuarios.findAll({
                where: {
                    estado: 1 // Filtrar por estado 1
                }
            });

            // Desencriptar contraseñas
            const decryptedUsers = users.map(user => {
                user.contrasenia = rot13(user.contrasenia);
                return user;
            });

            return res.status(200).send(decryptedUsers);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * Get todos los usuarios
    async find_all_users(req, res) {
        try {
            const users = await Usuarios.findAll();

            // Desencriptar contraseñas
            const decryptedUsers = users.map(user => {
                user.contrasenia = rot13(user.contrasenia);
                return user;
            });

            return res.status(200).send(decryptedUsers);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * Get usuario por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const user = await Usuarios.findByPk(id);
            if (!user) {
                return res.status(404).send({
                    message: 'Usuario no encontrado.'
                });
            }

            // Desencriptar contraseña
            user.contrasenia = rot13(user.contrasenia);
            return res.status(200).send(user);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al intentar recuperar el registro.'
            });
        }
    },

    // * Crear usuario
    async create(req, res) {
        const datos = req.body;
        const datos_ingreso = {
            usuario: datos.usuario,
            contrasenia: rot13(datos.contrasenia), // Encriptar con ROT13
            estado: 1, // Asignar valor predeterminado de 1
            idRol: datos.idRol, // Incluir el idRol en los datos de ingreso
            idSede: datos.idSede,
            idPersona: datos.idPersona
        };

        try {
            const newUser = await Usuarios.create(datos_ingreso);
            return res.status(201).send(newUser);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al insertar usuario' });
        }
    },

    // * Actualizar usuario
    async update(req, res) {
        const datos = req.body;
        const id = req.params.id;

        const camposActualizados = {};

        if (datos.usuario !== undefined) camposActualizados.usuario = datos.usuario;
        if (datos.contrasenia !== undefined) camposActualizados.contrasenia = rot13(datos.contrasenia); // Encriptar con ROT13 si se actualiza
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado; // Permite actualizar el estado
        if (datos.idRol !== undefined) camposActualizados.idRol = datos.idRol; // Permite actualizar el rol
        if (datos.idSede !== undefined) camposActualizados.idSede = datos.idSede; // Permite actualizar la sede
        if (datos.idPersona !== undefined) camposActualizados.idPersona = datos.idPersona; // Permite actualizar la persona

        try {
            const [rowsUpdated] = await Usuarios.update(camposActualizados, {
                where: { idUsuario: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).send({ message: 'Usuario no encontrado' });
            }

            return res.status(200).send('El usuario ha sido actualizado');
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al actualizar usuario' });
        }
    },

    // * Actualizar contraseña
    async update_password(req, res) {
        const { contraseniaActual, nuevaContrasenia } = req.body;
        const id = req.params.id;

        try {
            // Buscar el usuario por ID
            const user = await Usuarios.findByPk(id);
            if (!user) {
                return res.status(404).send({ message: 'Usuario no encontrado' });
            }

            // Verificar la contraseña actual
            if (user.contrasenia !== rot13(contraseniaActual)) {
                return res.status(401).send({ message: 'Contraseña actual incorrecta' });
            }

            // Actualizar la contraseña
            user.contrasenia = rot13(nuevaContrasenia);
            await user.save();

            return res.status(200).send('La contraseña ha sido actualizada');
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al actualizar la contraseña' });
        }
    },

    // * Eliminar usuario
    async delete(req, res) {
        const id = req.params.id;

        try {
            const user = await Usuarios.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            await user.destroy();
            return res.json({ message: 'Usuario eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            return res.status(500).json({ error: 'Error al eliminar usuario' });
        }
    }
};