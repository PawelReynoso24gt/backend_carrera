'use strict';
const { where } = require("sequelize");
const db = require("../models");
const PERSONAS = db.personas;
const MUNICIPIOS = db.municipios;
const ASPIRANTES = db.aspirantes;
const USUARIOS = db.usuarios;
const VOLUNTARIOS = db.voluntarios;
const uploadPerson = require('../middlewares/uploadPerson');
const path = require('path');
const bcrypt = require('bcryptjs');

const { generateQRCode } = require('./voluntariosController');

const toDateOnly = (v) => {
    const d = v ? new Date(v) : new Date();
    return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
};

// Métodos CRUD
module.exports = {

    // Obtener todas las personas
    async find(req, res) {
        try {
            const personas = await PERSONAS.findAll({
                include: {
                    model: MUNICIPIOS,
                },
                where: {
                    estado: 1
                }
            });
            return res.status(200).json(personas);
        } catch (error) {
            console.error('Error al recuperar las personas:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // Obtener personas activas
    async findActive(req, res) {
        try {
            const personas = await PERSONAS.findAll({
                where: {
                    estado: 1
                },
                include: {
                    model: MUNICIPIOS,
                }
            });
            return res.status(200).json(personas);
        } catch (error) {
            console.error('Error al listar personas activas:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar personas activas.'
            });
        }
    },

    // Obtener personas inactivas
    async findInactive(req, res) {
        try {
            const personas = await PERSONAS.findAll({
                where: {
                    estado: 0
                },
                include: {
                    model: MUNICIPIOS,
                }
            });
            return res.status(200).json(personas);
        } catch (error) {
            console.error('Error al listar personas inactivas:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar personas inactivas.'
            });
        }
    },

    // Obtener una persona por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const persona = await PERSONAS.findByPk(id, {
                include: {
                    model: MUNICIPIOS,
                }
            });

            if (!persona) {
                return res.status(404).json({ message: 'Persona no encontrada' });
            }

            return res.status(200).json(persona);
        } catch (error) {
            console.error(`Error al buscar persona con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar la persona.'
            });
        }
    },

    // Crear una nueva persona
    async create(req, res) {
        const datos = req.body;

        // Verificar campos requeridos
        if (!datos.nombre || !datos.fechaNacimiento || !datos.telefono || !datos.domicilio || !datos.CUI || !datos.correo || !datos.estado || !datos.idMunicipio) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        // Expresiones regulares para validaciones
        const regexNombre = /^[A-Za-záéíóúÁÉÍÓÚÑñ\s]+$/; // Solo letras y espacios
        const regexTelefono = /^\d{8}$/; // 8 dígitos
        const regexDomicilio = /^[A-Za-záéíóúÁÉÍÓÚÑñ0-9\s\.\-,]+$/; // Letras, dígitos, espacios, puntos, comas y guiones
        const regexCUI = /^\d{13}$/; // 13 dígitos
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato de correo electrónico

        // Validaciones
        if (!regexNombre.test(datos.nombre)) {
            return res.status(400).json({ message: 'El nombre solo puede contener letras y espacios.' });
        }
        if (!regexTelefono.test(datos.telefono)) {
            return res.status(400).json({ message: 'El teléfono debe contener exactamente 8 dígitos.' });
        }
        if (!regexDomicilio.test(datos.domicilio)) {
            return res.status(400).json({ message: 'El domicilio solo puede contener letras, dígitos, espacios, puntos y guiones.' });
        }
        if (!regexCUI.test(datos.CUI)) {
            return res.status(400).json({ message: 'El CUI debe contener exactamente 13 dígitos.' });
        }
        if (!regexCorreo.test(datos.correo)) {
            return res.status(400).json({ message: 'El correo electrónico no es válido.' });
        }

        const nuevaPersona = {
            nombre: datos.nombre,
            fechaNacimiento: toDateOnly(datos.fechaNacimiento),
            telefono: datos.telefono,
            domicilio: datos.domicilio,
            CUI: datos.CUI,
            correo: datos.correo,
            foto: datos.foto || 'SIN FOTO', // Asignar "SIN FOTO" si no se envía el dato
            estado: datos.estado !== undefined ? datos.estado : 1,
            idMunicipio: datos.idMunicipio,
            talla: datos.talla || null
        };

        try {
            // Crear registro en la tabla personas
            const persona = await PERSONAS.create(nuevaPersona);

            // Crear registro en la tabla aspirantes   

            return res.status(201).json({
                message: 'Persona creada correctamente',
                persona,
            });
        } catch (error) {
            console.error('Error al insertar la persona:', error);
            return res.status(500).json({ error: 'Error al insertar la persona' });
        }
    },


    // Crear una nueva persona y aspirante
    async createPerAspirante(req, res) {
        const datos = req.body;

        // Verificar campos requeridos
        if (!datos.nombre || !datos.fechaNacimiento || !datos.telefono || !datos.domicilio || !datos.CUI || !datos.correo || !datos.estado || !datos.idMunicipio) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        // Expresiones regulares para validaciones
        const regexNombre = /^[A-Za-záéíóúÁÉÍÓÚÑñ\s]+$/; // Solo letras y espacios
        const regexTelefono = /^\d{8}$/; // 8 dígitos
        const regexDomicilio = /^[A-Za-záéíóúÁÉÍÓÚÑñ0-9\s\.\-,]+$/; // Letras, dígitos, espacios, puntos, comas y guiones
        const regexCUI = /^\d{13}$/; // 13 dígitos
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato de correo electrónico

        // Validaciones
        if (!regexNombre.test(datos.nombre)) {
            return res.status(400).json({ message: 'El nombre solo puede contener letras y espacios.' });
        }
        if (!regexTelefono.test(datos.telefono)) {
            return res.status(400).json({ message: 'El teléfono debe contener exactamente 8 dígitos.' });
        }
        if (!regexDomicilio.test(datos.domicilio)) {
            return res.status(400).json({ message: 'El domicilio solo puede contener letras, dígitos, espacios, puntos y guiones.' });
        }
        if (!regexCUI.test(datos.CUI)) {
            return res.status(400).json({ message: 'El CUI debe contener exactamente 13 dígitos.' });
        }
        if (!regexCorreo.test(datos.correo)) {
            return res.status(400).json({ message: 'El correo electrónico no es válido.' });
        }

        const nuevaPersona = {
            nombre: datos.nombre,
            fechaNacimiento: datos.fechaNacimiento,
            telefono: datos.telefono,
            domicilio: datos.domicilio,
            CUI: datos.CUI,
            correo: datos.correo,
            foto: datos.foto || 'SIN FOTO', // Asignar "SIN FOTO" si no se envía el dato
            estado: datos.estado !== undefined ? datos.estado : 1,
            idMunicipio: datos.idMunicipio,
            talla: datos.talla || null
        };

        try {
            // Crear registro en la tabla personas
            const persona = await PERSONAS.create(nuevaPersona);

            // Crear registro en la tabla aspirantes
            const nuevoAspirante = {
                idPersona: persona.idPersona, // Usamos el ID generado de la persona
                fechaRegistro: toDateOnly(new Date()), // Fecha actual como fecha de registro
                estado: 1, // Estado por defecto
            };
            const aspirante = await ASPIRANTES.create(nuevoAspirante);

            return res.status(201).json({
                message: 'Persona y aspirante creados correctamente.',
                persona,
                aspirante,
            });
        } catch (error) {
            console.error('Error al insertar la persona o el aspirante:', error);
            return res.status(500).json({ error: 'Error al insertar la persona o el aspirante' });
        }
    },

    // Crear Persona + Aspirante + Usuario + Voluntario en una sola transacción
    async createPersonaAspiranteUsuario(req, res) {
        const { persona = {}, aspirante = {}, usuario = {}, voluntario = {} } = req.body || {};

        const regexNombre = /^[A-Za-záéíóúÁÉÍÓÚÑñ\s]+$/;
        const regexTelefono = /^\d{8}$/;
        const regexDomicilio = /^[A-Za-záéíóúÁÉÍÓÚÑñ0-9\s\.\-,]+$/;
        const regexCUI = /^\d{13}$/;
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexTalla = /^(XXS|XS|S|M|L|XL|XXL)$/; 


        const faltanPersona =
            !persona.nombre || !persona.fechaNacimiento || !persona.telefono ||
            !persona.domicilio || !persona.CUI || !persona.correo || persona.idMunicipio === undefined ||
            persona.talla == null || persona.talla.toString().trim() === '';

        if (faltanPersona) return res.status(400).json({ message: 'Faltan campos requeridos en persona.' });
        
        const tallaNormalizada = persona.talla.toString().trim().toUpperCase();
            if (!regexTalla.test(tallaNormalizada)) {
            return res.status(400).json({ message: 'La talla no es válida.' });
            }

        if (!regexNombre.test(persona.nombre)) return res.status(400).json({ message: 'El nombre solo puede contener letras y espacios.' });
        if (!regexTelefono.test(persona.telefono)) return res.status(400).json({ message: 'El teléfono debe contener exactamente 8 dígitos.' });
        if (!regexDomicilio.test(persona.domicilio)) return res.status(400).json({ message: 'El domicilio solo puede contener letras, dígitos, espacios, puntos y guiones.' });
        if (!regexCUI.test(persona.CUI)) return res.status(400).json({ message: 'El CUI debe contener exactamente 13 dígitos.' });
        if (!regexCorreo.test(persona.correo)) return res.status(400).json({ message: 'El correo electrónico no es válido.' });

        if (!usuario.usuario || !usuario.contrasenia || !usuario.idRol || !usuario.idSede) {
            return res.status(400).json({ message: 'Faltan datos requeridos en usuario (usuario, contrasenia, idRol, idSede).' });
        }

        const nuevaPersona = {
            nombre: persona.nombre,
            fechaNacimiento: toDateOnly(persona.fechaNacimiento),
            telefono: persona.telefono,
            domicilio: persona.domicilio,
            CUI: persona.CUI,
            correo: persona.correo,
            foto: persona.foto || 'SIN FOTO',
            estado: persona.estado !== undefined ? persona.estado : 1,
            idMunicipio: persona.idMunicipio,
            talla: tallaNormalizada, 
        };

        const nuevoAspirante = {
            fechaRegistro: toDateOnly(aspirante.fechaRegistro),
            estado: 1
        };

        const nuevoUsuario = {
            usuario: usuario.usuario,
            contrasenia: usuario.contrasenia,
            idRol: usuario.idRol,
            idSede: usuario.idSede,
            estado: usuario.estado !== undefined ? usuario.estado : 1
        };

        const nuevoVoluntario = {
            fechaRegistro: toDateOnly(voluntario.fechaRegistro),
            fechaSalida: voluntario.fechaSalida ? toDateOnly(voluntario.fechaSalida) : null,
            estado: voluntario.estado !== undefined ? voluntario.estado : 1
        };

        const t = await db.sequelize.transaction();
        try {
            const existeCui = await PERSONAS.findOne({ where: { CUI: nuevaPersona.CUI }, transaction: t });
            if (existeCui) { await t.rollback(); return res.status(409).json({ message: 'El CUI ya está registrado.' }); }

            const existeUsuario = await USUARIOS.findOne({ where: { usuario: nuevoUsuario.usuario }, transaction: t });
            if (existeUsuario) { await t.rollback(); return res.status(409).json({ message: 'El nombre de usuario ya está en uso.' }); }

            const personaCreada = await PERSONAS.create(nuevaPersona, { transaction: t });

            const aspiranteCreado = await ASPIRANTES.create({
                ...nuevoAspirante,
                idPersona: personaCreada.idPersona
            }, { transaction: t });

            const hash = await bcrypt.hash(nuevoUsuario.contrasenia, 10);
            const usuarioCreado = await USUARIOS.create({
                usuario: nuevoUsuario.usuario,
                contrasenia: hash,
                idRol: nuevoUsuario.idRol,
                idSede: nuevoUsuario.idSede,
                idPersona: personaCreada.idPersona,
                estado: nuevoUsuario.estado
            }, { transaction: t });


            const qrValue = (typeof generateQRCode === 'function')
                ? generateQRCode()
                : Math.floor(100000000 + Math.random() * 900000000).toString();

            const voluntarioCreado = await VOLUNTARIOS.create({
                codigoQR: qrValue,
                fechaRegistro: nuevoVoluntario.fechaRegistro,
                fechaSalida: nuevoVoluntario.fechaSalida,
                estado: nuevoVoluntario.estado,
                idPersona: personaCreada.idPersona
            }, { transaction: t });

            await t.commit();

            return res.status(201).json({
                message: 'Persona, aspirante, usuario y voluntario creados correctamente.',
                persona: personaCreada,
                aspirante: aspiranteCreado,
                usuario: { idUsuario: usuarioCreado.idUsuario, usuario: usuarioCreado.usuario },
                voluntario: voluntarioCreado
            });
        } catch (error) {
            await t.rollback();
            console.error('Error al crear persona/aspirante/usuario/voluntario:', error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                const field = (error.errors?.[0]?.path || '').toLowerCase();
                if (field.includes('cui')) return res.status(409).json({ message: 'El CUI ya está registrado.' });
                if (field.includes('usuario')) return res.status(409).json({ message: 'El nombre de usuario ya está en uso.' });
                if (field.includes('codigoqr')) return res.status(409).json({ message: 'Código QR ya existe, reintenta el registro.' });
            }

            return res.status(500).json({ message: 'Error al crear persona, aspirante, usuario y voluntario.' });
        }
    },

    // Actualizar una persona existente
    async update(req, res) {
        const datos = req.body;
        const id = req.params.id;

        const camposActualizados = {};

        // Expresiones regulares para validaciones
        const regexNombre = /^[A-Za-záéíóúÁÉÍÓÚÑñ\s]+$/; // Solo letras y espacios
        const regexTelefono = /^\d{8}$/; // 8 dígitos
        const regexDomicilio = /^[A-Za-záéíóúÁÉÍÓÚÑñ0-9\s\.\-,]+$/; // Letras, dígitos, espacios, puntos y guiones
        const regexCUI = /^\d{13}$/; // 13 dígitos
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato de correo electrónico

        // Validaciones
        if (datos.nombre !== undefined && !regexNombre.test(datos.nombre)) {
            return res.status(400).json({ message: 'El nombre solo puede contener letras y espacios.' });
        }
        if (datos.telefono !== undefined && !regexTelefono.test(datos.telefono)) {
            return res.status(400).json({ message: 'El teléfono debe contener exactamente 8 dígitos.' });
        }
        if (datos.domicilio !== undefined && !regexDomicilio.test(datos.domicilio)) {
            return res.status(400).json({ message: 'El domicilio solo puede contener letras, dígitos, espacios, puntos y guiones.' });
        }
        if (datos.CUI !== undefined && !regexCUI.test(datos.CUI)) {
            return res.status(400).json({ message: 'El CUI debe contener exactamente 13 dígitos.' });
        }
        if (datos.correo !== undefined && !regexCorreo.test(datos.correo)) {
            return res.status(400).json({ message: 'El correo electrónico no es válido.' });
        }

        // Asignar campos actualizados
        if (datos.nombre !== undefined) camposActualizados.nombre = datos.nombre;
        if (datos.fechaNacimiento !== undefined) camposActualizados.fechaNacimiento = datos.fechaNacimiento;
        if (datos.telefono !== undefined) camposActualizados.telefono = datos.telefono;
        if (datos.domicilio !== undefined) camposActualizados.domicilio = datos.domicilio;
        if (datos.CUI !== undefined) camposActualizados.CUI = datos.CUI;
        if (datos.correo !== undefined) camposActualizados.correo = datos.correo;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
        if (datos.idMunicipio !== undefined) camposActualizados.idMunicipio = datos.idMunicipio;
        //talla
        if (datos.talla !== undefined) camposActualizados.talla = datos.talla;

        try {
            const [rowsUpdated] = await PERSONAS.update(
                camposActualizados,
                {
                    where: { idPersona: id }
                }
            );
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Persona no encontrada' });
            }
            return res.status(200).json({ message: 'La persona ha sido actualizada' });
        } catch (error) {
            console.error(`Error al actualizar la persona con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar la persona' });
        }
    },

    // Actualizar solo la foto de una persona
    async updateFoto(req, res) {
        const id = req.params.id;

        try {
            const persona = await PERSONAS.findByPk(id);
            if (!persona) {
                return res.status(404).json({ message: 'Persona no encontrada' });
            }

            let fotoRuta = 'personas_image/sin-foto.png'; // Valor predeterminado
            if (req.file) {
                fotoRuta = `personas_image/${req.file.filename}`; // Guardar la ruta relativa
            }

            persona.foto = fotoRuta;
            await persona.save();
            return res.status(200).json({ message: 'Foto actualizada correctamente', persona });
        } catch (error) {
            console.error(`Error al actualizar la foto de la persona con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar la foto' });
        }
    },

    // Eliminar una persona
    async delete(req, res) {
        const id = req.params.id;

        try {
            const persona = await PERSONAS.findByPk(id);

            if (!persona) {
                return res.status(404).json({ error: 'Persona no encontrada' });
            }

            await persona.destroy();
            return res.status(200).json({ message: 'Persona eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar persona:', error);
            return res.status(500).json({ error: 'Error al eliminar persona' });
        }
    }
};
