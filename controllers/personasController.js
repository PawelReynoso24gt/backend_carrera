'use strict';
const { where } = require("sequelize");
const db = require("../models");
const PERSONAS = db.personas;
const MUNICIPIOS = db.municipios;
const ASPIRANTES = db.aspirantes;


// Métodos CRUD
module.exports = {

    // Obtener todas las personas
    async find(req, res) {
        try {
            const personas = await PERSONAS.findAll({
                include: {
                    model: MUNICIPIOS,
                    attributes: ["idMunicipio", "municipio"],
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
                    attributes: ["idMunicipio", "municipio"],
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
                    attributes: ["idMunicipio", "municipio"],
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
                    attributes: ["idMunicipio", "municipio"],
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
        const regexDomicilio = /^[A-Za-záéíóúÁÉÍÓÚÑñ0-9\s\.\-]+$/; // Letras, dígitos, espacios, puntos y guiones
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
            idMunicipio: datos.idMunicipio
        };
    
        try {
            // Crear registro en la tabla personas
            const persona = await PERSONAS.create(nuevaPersona);
    
            // Crear registro en la tabla aspirantes
            const nuevoAspirante = {
                idPersona: persona.idPersona, // Usamos el ID generado de la persona
                fechaRegistro: new Date(), // Fecha actual como fecha de registro
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
    

    // Actualizar una persona existente
    async update(req, res) {
        const datos = req.body;
        const id = req.params.id;

        const camposActualizados = {};

        // Expresiones regulares para validaciones
        const regexNombre = /^[A-Za-záéíóúÁÉÍÓÚÑñ\s]+$/; // Solo letras y espacios
        const regexTelefono = /^\d{8}$/; // 8 dígitos
        const regexDomicilio = /^[A-Za-záéíóúÁÉÍÓÚÑñ0-9\s\.\-]+$/; // Letras, dígitos, espacios, puntos y guiones
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
