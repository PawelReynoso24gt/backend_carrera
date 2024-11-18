// ! Controlador de usuarios
'use strict';
const Sequelize = require('sequelize');
const crypto = require('crypto'); // Libreria para hashear passwords
const db = require('../models');
const USERS = db.usuarios;
const ROLES = db.roles;

// Función para hashear la contraseña usando SHA-256
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Validación de entrada
function validateUserData(datos, esCreacion = false) {
    const usuarioRegex = /^[a-z0-9-_]+$/; // Solo minúsculas, números, guion y guion bajo

    if (datos.usuario !== undefined && !usuarioRegex.test(datos.usuario)) {
        return 'El nombre de usuario solo debe contener minúsculas, números, "-" o "_"';
    }

    if (esCreacion || datos.contrasenia !== undefined) {
        if (!datos.contrasenia || datos.contrasenia.length < 8) {
            return 'La contraseña debe tener al menos 8 caracteres';
        }
    }

    if (datos.idRol !== undefined && datos.idRol < 1) {
        return 'El rol es inválido';
    }
    if (datos.idSede !== undefined && datos.idSede < 1) {
        return 'La sede es inválida';
    }
    if (datos.idPersona !== undefined && datos.idPersona < 1) {
        return 'La persona es inválida';
    }

    return null;
}

// Validación de actualización de contraseña
function validatePasswordChange(currentPassword, newPassword) {
    if (!currentPassword) {
        return 'La contraseña actual es requerida';
    }
    if (!newPassword || newPassword.length < 8) {
        return 'La nueva contraseña debe tener al menos 8 caracteres';
    }
    return null;
}

module.exports = {
    // * Get usuarios activos
    async find(req, res) {
        try {
            const users = await USERS.findAll({
                where: { estado: 1 },
                include : { model : ROLES, attributes: ['idRol', 'roles'] }
            });
    
            const dataUsers = users.map(user => {
                const { contrasenia, token, tokenExpiresAt, ...userWithoutPasswordAndTokens } = user.dataValues;
                return userWithoutPasswordAndTokens;
            });
    
            return res.status(200).send(dataUsers);
        } catch (error) {
            console.error('Error al recuperar los datos:', error);
            return res.status(500).send({ message: 'Ocurrió un error al recuperar los datos.' });
        }
    },

    // * Get todos los usuarios
    async findAllUsers(req, res) {
        try {
            const users = await USERS.findAll();

            const dataUsers = users.map(user => {
                const { contrasenia, token, tokenExpiresAt, ...userWithoutPasswordAndTokens } = user.dataValues;
                return userWithoutPasswordAndTokens;
            });
    
            return res.status(200).send(dataUsers);
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
            const user = await USERS.findByPk(id);
            if (!user) {
                return res.status(404).send({ message: 'Usuario no encontrado.' });
            }

            const { contrasenia, token, tokenExpiresAt, ...userWithoutPasswordAndTokens } = user.dataValues;
            return res.status(200).send(userWithoutPasswordAndTokens);
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: 'Ocurrió un error al intentar recuperar el registro.' });
        }
    },

    // * Crear usuario
    async create(req, res) {
        const datos = req.body;

        // Validar los datos del usuario
        const error = validateUserData(datos);
        if (error) {
            return res.status(400).json({ error });
        }
        const datosIngreso = {
            usuario: datos.usuario,
            contrasenia: hashPassword(datos.contrasenia),
            estado: 1,
            idRol: datos.idRol,
            idSede: datos.idSede,
            idPersona: datos.idPersona
        };

        try {
            const newUser = await USERS.create(datosIngreso);
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

        const error = validateUserData(datos);
        if (error) {
            return res.status(400).json({ error });
        }

        const camposActualizados = {};

        if (datos.usuario !== undefined) camposActualizados.usuario = datos.usuario;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
        if (datos.idRol !== undefined) camposActualizados.idRol = datos.idRol;
        if (datos.idSede !== undefined) camposActualizados.idSede = datos.idSede;
        if (datos.idPersona !== undefined) camposActualizados.idPersona = datos.idPersona;

        try {
            const [rowsUpdated] = await USERS.update(camposActualizados, {
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
    async updatePassword(req, res) {
        const { currentPassword, newPassword } = req.body;
        const id = req.params.id;
    
        // Validar las contraseñas
        const error = validatePasswordChange(currentPassword, newPassword);
        if (error) {
            return res.status(400).json({ error });
        }
    
        try {
            // Buscar el usuario por ID
            const user = await USERS.findByPk(id);
            if (!user) {
                return res.status(404).send({ message: 'Usuario no encontrado' });
            }
    
            // Verificar la contraseña actual
            if (user.contrasenia !== hashPassword(currentPassword)) {
                return res.status(401).send({ message: 'Contraseña actual incorrecta' });
            }
    
            // Actualizar la contraseña con SHA-256
            user.contrasenia = hashPassword(newPassword);
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
            const user = await USERS.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            await user.destroy();
            return res.json({ message: 'Usuario eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            return res.status(500).json({ error: 'Error al eliminar usuario' });
        }
    },

    hashPassword
};