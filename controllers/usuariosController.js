// ! Controlador de usuarios
'use strict';
const Sequelize = require('sequelize');
const crypto = require('crypto'); // Librería para hashear contraseñas
const jwt = require('jsonwebtoken');
const db = require('../models');
const USERS = db.usuarios;
const ROLES = db.roles;
const PERSONAS = db.personas;
const VOLUNTARIOS = db.voluntarios;
const EMPLEADO = db.empleados;

// Función para hashear la contraseña usando SHA-256
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Validación de entrada
function validateUserData(datos) {
    const usuarioRegex = /^[a-z0-9-_]+$/; // Solo minúsculas, números, guion y guion bajo

    if (datos.usuario !== undefined && !usuarioRegex.test(datos.usuario)) {
        return 'El nombre de usuario solo debe contener minúsculas, números, "-" o "_"';
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

// Validación de contraseña
function validatePassword(datos, esCreacion = false) {
    if (esCreacion || datos.contrasenia !== undefined) {
        if (!datos.contrasenia) {
            return 'La contraseña no puede estar vacía';
        }
        if (datos.contrasenia.length < 8) {
            return 'La contraseña debe tener al menos 8 caracteres';
        }
        if (!/[A-Z]/.test(datos.contrasenia)) {
            return 'La contraseña debe contener al menos una letra mayúscula';
        }
        if (!/[a-z]/.test(datos.contrasenia)) {
            return 'La contraseña debe contener al menos una letra minúscula';
        }
        if (!/\d/.test(datos.contrasenia)) {
            return 'La contraseña debe contener al menos un número';
        }
        if (!/[@$!%*?&#]/.test(datos.contrasenia)) {
            return 'La contraseña debe contener al menos un carácter especial (@, $, !, %, *, ?, &, #)';
        }
    }

    return null;
}

// Validación de actualización de contraseña
function validatePasswordChange(currentPassword, newPassword) {
    if (!currentPassword) {
        return 'La contraseña actual es requerida';
    }
    const validatePassword = (password) => {
        if (password.length < 8) {
            return "La contraseña es demasiado corta.";
        } else if (!/[A-Z]/.test(password)) {
            return "La contraseña debe contener al menos una letra mayúscula.";
        } else if (!/[a-z]/.test(password)) {
            return "La contraseña debe contener al menos una letra minúscula.";
        } else if (!/[0-9]/.test(password)) {
            return "La contraseña debe contener al menos un número.";
        } else if (!/[!@#$%^&*]/.test(password)) {
            return "La contraseña debe contener al menos un carácter especial.";
        }
        return null;
    };

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
        return passwordError;
    }

    return null;
}

// Función para generar un token JWT
function generateToken(user) {
    //console.log('Datos del usuario antes de generar el token:', user);
    const payload = {
        idUsuario: user.idUsuario,
        usuario: user.usuario,
        idRol: user.idRol,
        idSede: user.idSede,
        idPersona: user.idPersona,
        idVoluntario: user.idVoluntario ?? null,
        idEmpleado: user.idEmpleado ?? null,
        codigoQR: user.codigoQR ?? null,
    };

    // Generar un token firmado con una duración de 1 hora
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
    //console.log('Token generado:', token); // Imprime el token generado

    return token;
}

// Crear un nuevo token y almacenar en la base de datos
async function createToken(user, idVoluntario, idEmpleado, codigoQR) {
    // Extrae solo los valores planos del usuario
    const userData = user.get({ plain: true });

    const token = generateToken({
        idUsuario: userData.idUsuario,
        usuario: userData.usuario,
        idRol: userData.idRol,
        idSede: userData.idSede,
        idPersona: user.persona?.idPersona,
        idVoluntario: idVoluntario,
        idEmpleado: idEmpleado,
        codigoQR: codigoQR,
    });

    // Calcular la fecha de expiración al final del día
    const now = new Date();
    const expiresAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Actualizar el token en la base de datos
    await USERS.update({
        token,            // El token generado
        tokenExpiresAt: expiresAt // Fecha de expiración del token
    }, {
        where: { idUsuario: userData.idUsuario }
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

// Ejemplo de definición de la función getUserById
async function getUserById(idUsuario) {
    try {
        const user = await USERS.findOne({ where: { idUsuario } });
        return user;
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        throw error;
    }
}

// Ejemplo de definición de la función updateUserToken
async function updateUserToken(idUsuario, newToken) {
    try {
        await USERS.update({ token: newToken }, { where: { idUsuario } });
    } catch (error) {
        console.error("Error al actualizar el token del usuario:", error);
        throw error;
    }
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
                },
                include: [
                    {
                        model: PERSONAS, // Relación con personas
                        attributes: ['idPersona'], // Extraer idPersona
                        include: [
                            {
                                model: VOLUNTARIOS, // Relación desde personas a voluntarios
                                attributes: ['idVoluntario', 'codigoQR'], // Extraer idVoluntario
                            },
                            {
                                model: EMPLEADO, // Relación desde personas a empleados
                                attributes: ['idEmpleado'], // Extraer idEmpleado
                            }
                        ],
                    },
                ],
            });

            if (!user) {
                return res.status(404).send({
                    message: 'Credenciales inválidas o cuenta inactiva.'
                });
            }
            // Extraer datos necesarios para el token
            const idVoluntario = user.persona?.voluntarios?.[0]?.idVoluntario || null;
            const idEmpleado = user.persona?.empleados?.[0]?.idEmpleado || null;
            const codigoQR = user.persona?.voluntarios?.[0]?.codigoQR || null;
            //console.log("ID del voluntario:", idVoluntario); // Log para depuración

            // Generar el token JWT y almacenarlo en la base de datos
            const token = await createToken(user, idVoluntario, idEmpleado, codigoQR);

            return res.status(200).send({
                message: 'Inicio de sesión exitoso.',
                usuario: {
                    idUsuario: user.idUsuario,
                    usuario: user.usuario,
                    estado: user.estado,
                    idRol: user.idRol,
                    idSede: user.idSede,
                    idPersona: user.idPersona,
                    idVoluntario: idVoluntario ?? null,
                    idEmpleado: idEmpleado ?? null,
                    codigoQR: codigoQR ?? null,
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
                    },
                    { model: PERSONAS, attributes: ['idPersona', 'nombre', 'fechaNacimiento', 'telefono', 'domicilio', 'correo', 'foto', 'idMunicipio', 'createdAt'] }],
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
        try {
            const users = await USERS.findAll({
                include: [{
                    model: ROLES,
                    attributes: ['roles']
                }]
            });

            const dataUsers = users.map(user => {
                const { contrasenia, token, tokenExpiresAt, ...userWithoutPasswordAndTokens } = user.dataValues;
                return userWithoutPasswordAndTokens;
            });
            return res.status(200).send(dataUsers);
        } catch {
            console.error('Error al traer los datos:', error);
            return res.status(500).send({ message: 'Ocurrio un error al traer los datos' })
        }
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
        const error = validateUserData(datos, true);
        if (error) {
            return res.status(400).json({ error });
        }
        const datosIngreso = {
            usuario: datos.usuario,
            contrasenia: hashPassword(datos.contrasenia),
            changedPassword: 0,
            passwordCreatedAt: new Date(),
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
            user.passwordCreatedAt = new Date(); // Actualizar la fecha de creación de la contraseña
            user.changedPassword = 1; // Marcar la contraseña como cambiada
            await user.save();

            return res.status(200).send('La contraseña ha sido actualizada');
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al actualizar la contraseña' });
        }
    },

    // * Reiniciar contraseña para superadmin
    async resetPassword(req, res) {
        const { newPassword } = req.body; // Nueva contraseña proporcionada en el cuerpo de la solicitud
        const id = req.params.id; // ID del usuario obtenido de los parámetros de la solicitud

        // Validar la nueva contraseña
        /*const error = validatePasswordChange(newPassword); // Reutilizar la función para validar contraseñas
        if (error) {
            return res.status(400).json({ error });
        }*/

        try {
            // Buscar el usuario por ID
            const user = await USERS.findByPk(id);
            if (!user) {
                return res.status(404).send({ message: 'Usuario no encontrado' });
            }

            // Actualizar la contraseña con SHA-256
            user.contrasenia = hashPassword(newPassword);
            user.changedPassword = 0; // Marcar la contraseña como cambiada
            user.passwordCreatedAt = new Date(); // Actualizar la fecha de creación de la contraseña
            await user.save();

            return res.status(200).send('La contraseña ha sido reiniciada exitosamente');
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al reiniciar la contraseña' });
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

    hashPassword,

    async verifyChangedPassword(req, res) {
        try {
            const idUsuario = req.userId; // Obtenido del token
            const PASSWORD_CHANGE_GRACE_PERIOD = 15; // Período de gracia en días

            const user = await USERS.findByPk(idUsuario, {
                attributes: ['changedPassword', 'passwordCreatedAt'], // Obtener también la fecha de creación de la contraseña
            });

            if (!user) {
                return res.status(404).send({ message: 'Usuario no encontrado.' });
            }

            if (user.changedPassword === 0) {
                const now = new Date();
                const passwordExpirationDate = new Date(user.passwordCreatedAt);
                passwordExpirationDate.setDate(passwordExpirationDate.getDate() + PASSWORD_CHANGE_GRACE_PERIOD);

                const timeDiff = passwordExpirationDate - now;
                const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                return res.status(200).send({
                    changedPassword: 0,
                    daysRemaining: daysRemaining,
                    message: `Necesitas cambiar tu contraseña. Te quedan ${daysRemaining} días para cambiarla, de lo contrario, tu usuario será bloqueado.`,
                });
            }

            return res.status(200).send({
                changedPassword: 1,
                message: 'Tu contraseña ya ha sido cambiada.',
            });
        } catch (error) {
            console.error("Error al verificar el estado de la contraseña:", error);
            return res.status(500).send({ message: 'Error interno del servidor.' });
        }
    },

    async renewToken(req, res) {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            console.log("Token no proporcionado.");
            return res.status(401).json({ message: "Token no proporcionado." });
        }

        try {
            // Verificar el token y extraer el payload
            const payload = jwt.verify(token, process.env.SECRET_KEY);
            //console.log("Payload del token:", payload);

            // Obtener el usuario de la base de datos
            const user = await getUserById(payload.idUsuario);
            if (!user) {
                console.log("Usuario no encontrado.");
                return res.status(403).send('Token inválido o expirado.');
            }
            if (user.token !== token) {
                //console.log("El token no coincide con el almacenado en la base de datos.");
                return res.status(403).send('Token inválido o expirado.');
            }

            // Generar un nuevo token con la misma información que el token original
            const newToken = jwt.sign({
                idUsuario: user.idUsuario,
                usuario: user.usuario,
                idRol: user.idRol,
                idSede: user.idSede,
                idPersona: user.idPersona,
                idVoluntario: user.idVoluntario,
                idEmpleado: user.idEmpleado,
                codigoQR: user.codigoQR,
            }, process.env.SECRET_KEY, { expiresIn: '15m' }); // Renueva por 15 minutos más

            // Actualizar el token en la base de datos
            await updateUserToken(user.idUsuario, newToken);
            //console.log("Token renovado exitosamente:", newToken);

            return res.status(200).json({ token: newToken });
        } catch (error) {
            console.log("Error al renovar el token:", error);
            return res.status(401).json({ message: "Token inválido o expirado." });
        }
    },

    async getLoggedUser(req, res) {
        try {
            // El token incluye el `idUsuario` extraído previamente
            const idUsuario = req.userId; // Asegúrate de que `req.userId` sea extraído del middleware de autenticación

            const user = await USERS.findOne({
                where: { idUsuario },
                include: [
                    {
                        model: PERSONAS,
                        as: "persona",
                        attributes: ["nombre"], // Solo necesitamos el nombre de la persona
                    },
                ],
            });

            if (!user) {
                return res.status(404).json({ message: "Usuario no encontrado." });
            }

            return res.status(200).json({
                idUsuario: user.idUsuario,
                usuario: user.usuario,
                nombre: user.persona?.nombre || "Sin nombre",
            });
        } catch (error) {
            console.error("Error al obtener el usuario logueado:", error);
            return res.status(500).json({ message: "Error al obtener el usuario logueado." });
        }
    }
};