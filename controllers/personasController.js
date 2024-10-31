'use strict';
const db = require("../models");
const PERSONAS = db.personas;

// Métodos CRUD
module.exports = {

    // Obtener todas las personas
    async find(req, res) {
        try {
            const personas = await PERSONAS.findAll();
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
            const persona = await PERSONAS.findByPk(id);

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

        if (!datos.nombre || !datos.fechaNacimiento || !datos.telefono || !datos.domicilio || !datos.CUI || !datos.correo || !datos.idMunicipio) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        const nuevaPersona = { 
            nombre: datos.nombre,
            fechaNacimiento: datos.fechaNacimiento,
            telefono: datos.telefono,
            domicilio: datos.domicilio,
            CUI: datos.CUI,
            correo: datos.correo,
            idMunicipio: datos.idMunicipio
        };

        try {
            const persona = await PERSONAS.create(nuevaPersona);
            return res.status(201).json(persona);
        } catch (error) {
            console.error('Error al insertar la persona:', error);
            return res.status(500).json({ error: 'Error al insertar la persona' });
        }
    },

    // Actualizar una persona existente
    async update(req, res) {
        const datos = req.body;
        const id = req.params.id;

        const camposActualizados = {};
    
        if (datos.nombre !== undefined) camposActualizados.nombre = datos.nombre;
        if (datos.fechaNacimiento !== undefined) camposActualizados.fechaNacimiento = datos.fechaNacimiento;
        if (datos.telefono !== undefined) camposActualizados.telefono = datos.telefono;
        if (datos.domicilio !== undefined) camposActualizados.domicilio = datos.domicilio;
        if (datos.CUI !== undefined) camposActualizados.CUI = datos.CUI;
        if (datos.correo !== undefined) camposActualizados.correo = datos.correo;
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
