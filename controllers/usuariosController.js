// ! Controlador de usuarios
'use strict';
const Sequelize = require('sequelize');
const crypto = require('crypto'); // Librería para hashear contraseñas
const jwt = require('jsonwebtoken');
const db = require('../models');
const USERS = db.usuarios;
const ROLES = db.roles;

// Función para hashear la contraseña usando SHA-256
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Función para generar un token JWT
function generateToken(user) {
    const payload = {
        idUsuario: user.idUsuario,
        usuario: user.usuario
    };

    // Generar un token firmado con una duración de 1 hora
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });

    return token;
}

// Crear un nuevo token y almacenar en la base de datos
async function createToken(userId) {
    const token = generateToken({ idUsuario: userId });
    const expiresAt = new Date(Date.now() + 3600000); // Expira en 1 hora

    await USERS.update({
        token,
        tokenExpiresAt: expiresAt
    }, {
        where: { idUsuario: userId }
    });

    return token;
}

// Eliminar el token del usuario
async function deleteToken(userId) {
    await USERS.update({
        token: null,
        tokenExpiresAt: null
    }, {
        where: { idUsuario: userId }
    });
}

module.exports = {
    // * Login
    async login(req, res) {
        const { usuario, contrasenia } = req.body;

        try {
            // Buscar el usuario por nombre y contraseña hash
            const user = await USERS.findOne({
                where: {
                    usuario: usuario,
                    contrasenia: hashPassword(contrasenia),
                    estado: 1 // Verificamos que el usuario esté activo
                }
            });

            if (!user) {
                return res.status(404).send({
                    message: 'Credenciales inválidas o cuenta inactiva.'
                });
            }

            // Generar el token JWT y almacenarlo en la base de datos
            const token = await createToken(user.idUsuario);

            return res.status(200).send({
                message: 'Inicio de sesión exitoso.',
                usuario: {
                    idUsuario: user.idUsuario,
                    usuario: user.usuario,
                    estado: user.estado,
                    idRol: user.idRol,
                    idSede: user.idSede,
                    idPersona: user.idPersona
                },
                token: token // Devolver el token al cliente
            });
        } catch (error) {
            console.error('Error en el login:', error);
            return res.status(500).send({
                message: 'Ocurrió un error al intentar iniciar sesión.'
            });
        }
    },

    // * Logout
    async logout(req, res) {
        const id = req.params.id;
    
        if (!id) {
            return res.status(400).send({ error: 'ID de usuario no proporcionado' });
        }
    
        try {
            // Buscar el usuario por ID
            console.log("Buscando usuario con ID:", id); // Log para depuración
            const user = await USERS.findByPk(id);
            if (!user) {
                return res.status(404).send({ message: 'Usuario no encontrado' });
            }
    
            // Eliminar el token del usuario
            console.log("Eliminando token del usuario..."); // Log para depuración
            user.token = null;
            user.tokenExpiresAt = null;
            await user.save();
    
            console.log("Token eliminado exitosamente."); // Log para depuración
            return res.status(200).send({ message: 'Sesión cerrada exitosamente' });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            return res.status(500).send({ error: 'Error al cerrar sesión' });
        }
    },    

    // * Obtener usuarios activos
    async find(req, res) {
        try {
            const users = await USERS.findAll({
                include: [
                    {
                      model: ROLES,
                      attributes: ['roles'], 
                    }],
                where: { estado: 1 }
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
            return USERS.findAll({
                include: [{
                    model: ROLES,
                    attributes: ['roles'] 
                }]
            })
            .then((users) => {
                res.status(200).send(users);
            })
            .catch((error) => {
                res.status(500).send({
                    message: error.message || 'Error al listar los usuarios.'
                });
            });
        },

    // * Obtener usuario por ID
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
        /*const error = validateUserData(datos, true);
        if (error) {
            return res.status(400).json({ error });
        }*/
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

            // Eliminar el token del usuario antes de eliminar el usuario
            await deleteToken(user.idUsuario);

            await user.destroy();
            return res.json({ message: 'Usuario eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            return res.status(500).json({ error: 'Error al eliminar usuario' });
        }
    },

    hashPassword
};