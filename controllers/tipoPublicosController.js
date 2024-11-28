'use strict';
const db = require("../models");
const TIPOS_PUBLICOS = db.tipo_publicos;

// Métodos CRUD
module.exports = {

    // Obtener todos los tipos de público
    async find(req, res) {
        try {
            const tipoPublicos = await TIPOS_PUBLICOS.findAll({
                where: {
                    estado: 1
                }
            });
            return res.status(200).json(tipoPublicos);
        } catch (error) {
            console.error('Error al recuperar los tipos de publicos:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // Obtener todos los tipos de público activos
    async findActive(req, res) {
        try {
            const tiposPublicos = await TIPOS_PUBLICOS.findAll({
                where: {
                    estado: 1 
                }
            });
            return res.status(200).json(tiposPublicos);
        } catch (error) {
            console.error('Error al listar los tipos de público activos:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar los tipos de público activos.'
            });
        }
    },

    // Obtener todos los tipos de público inactivos
    async findInactive(req, res) {
        try {
            const tiposPublicos = await TIPOS_PUBLICOS.findAll({
                where: {
                    estado: 0 
                }
            });
            return res.status(200).json(tiposPublicos);
        } catch (error) {
            console.error('Error al listar los tipos de público inactivos:', error);
            return res.status(500).json({
                message: error.message || 'Error al listar los tipos de público inactivos.'
            });
        }
    },

    // Obtener tipo de público por ID 
    async findById(req, res) {
        const id = req.params.id;

        try {
            const tipoPublico = await TIPOS_PUBLICOS.findByPk(id);

            if (!tipoPublico) {
                return res.status(404).json({ message: 'Tipo de público no encontrado' });
            }

            return res.status(200).json(tipoPublico);
        } catch (error) {
            console.error(`Error al buscar tipo de público con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar el tipo de público.'
            });
        }
    },

    // Crear un nuevo tipo de público
    async create(req, res) {
        const datos = req.body;

        if (!datos.nombreTipo) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        // Validación de solo letras con expresion regular
        const nombreTipoRegex = /^[A-Za-záéíóúÁÉÍÓÚÑñ\s]+$/;
        if (!nombreTipoRegex.test(datos.nombreTipo)) {
            return res.status(400).json({ message: 'El nombre del tipo de público solo puede contener letras.' });
        }

        const nuevoTipoPublico = { 
            nombreTipo: datos.nombreTipo,
            estado: datos.estado !== undefined ? datos.estado : 1 
        };

        try {
            const tipoPublicoCreado = await TIPOS_PUBLICOS.create(nuevoTipoPublico);
            return res.status(201).json({
                message: 'Tipo de público creado con éxito',
                createdTipoPublico: tipoPublicoCreado
            });
        } catch (error) {
            console.error('Error al insertar el tipo de público:', error);
            return res.status(500).json({ error: 'Error al insertar el tipo de público' });
        }
    },

    // Actualizar un tipo de público existente
    async update(req, res) {
        const datos = req.body;
        const id = req.params.id;

        const camposActualizados = {};
    
        // Validación del nombreTipo
        if (datos.nombreTipo !== undefined) {
            const nombreTipoRegex = /^[A-Za-záéíóúÁÉÍÓÚÑñ\s]+$/;
            if (!nombreTipoRegex.test(datos.nombreTipo)) {
                return res.status(400).json({ message: 'El nombre del tipo de público solo puede contener letras.' });
            }
        camposActualizados.nombreTipo = datos.nombreTipo;
        }
        if (datos.estado !== undefined) {
            if (![0, 1].includes(datos.estado)) {
                return res.status(400).json({ message: 'El estado debe ser 0 (inactivo) o 1 (activo).' });
            }
            camposActualizados.estado = datos.estado; 
        }
        try {
            const [rowsUpdated] = await TIPOS_PUBLICOS.update(
                camposActualizados,
                {
                    where: { idTipoPublico: id } 
                }
            );
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Tipo de público no encontrado' });
            }
            // Obtener el registro actualizado
        const tipoPublicoActualizado = await TIPOS_PUBLICOS.findByPk(id);
        // Devolver el mensaje junto con el objeto actualizado
        return res.status(200).json({
            message: `El tipo de público con ID: ${id} ha sido actualizado`,
            updatedTipoPublico: tipoPublicoActualizado
        });
        } catch (error) {
            console.error(`Error al actualizar el tipo de público con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar tipo de público' });
        }
    },  

    // Eliminar un tipo de público
    async delete(req, res) {
        const id = req.params.id; 
    
        try {
            const tipoPublico = await TIPOS_PUBLICOS.findByPk(id);
    
            if (!tipoPublico) {
                return res.status(404).json({ error: 'Tipo de público no encontrado' });
            }
    
            await tipoPublico.destroy();
            return res.status(200).json({ message: 'Tipo de público eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar tipo de público:', error);
            return res.status(500).json({ error: 'Error al eliminar tipo de público' });
        }
    }
};
