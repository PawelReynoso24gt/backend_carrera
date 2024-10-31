'use strict';
const db = require("../models");
const CATEGORIA_BITACORAS = db.categoria_bitacoras;

// Métodos CRUD
module.exports = {

    // Obtener todas las categorías de bitácoras
    async find(req, res) {
        try {
            const categoriasBitacoras = await CATEGORIA_BITACORAS.findAll();
            return res.status(200).json(categoriasBitacoras);
        } catch (error) {
            console.error('Error al recuperar las categorías de bitácoras:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // Obtener una categoría de bitácora por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const categoriaBitacora = await CATEGORIA_BITACORAS.findByPk(id);

            if (!categoriaBitacora) {
                return res.status(404).json({ message: 'Categoría de bitácora no encontrada' });
            }

            return res.status(200).json(categoriaBitacora);
        } catch (error) {
            console.error(`Error al buscar categoría de bitácora con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar la categoría de bitácora.'
            });
        }
    },

    // Crear una nueva categoría de bitácora
    async create(req, res) {
        const datos = req.body;

        if (!datos.categoria) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        const nuevaCategoriaBitacora = { 
            categoria: datos.categoria
        };

        try {
            const categoriaBitacora = await CATEGORIA_BITACORAS.create(nuevaCategoriaBitacora);
            return res.status(201).json(categoriaBitacora);
        } catch (error) {
            console.error('Error al insertar la categoría de bitácora:', error);
            return res.status(500).json({ error: 'Error al insertar la categoría de bitácora' });
        }
    },

    // Actualizar una categoría de bitácora existente
    async update(req, res) {
        const datos = req.body;
        const id = req.params.id;

        const camposActualizados = {};
    
        if (datos.categoria !== undefined) camposActualizados.categoria = datos.categoria;

        try {
            const [rowsUpdated] = await CATEGORIA_BITACORAS.update(
                camposActualizados,
                {
                    where: { idCategoriaBitacora: id } 
                }
            );
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Categoría de bitácora no encontrada' });
            }
            return res.status(200).json({ message: 'La categoría de bitácora ha sido actualizada' });
        } catch (error) {
            console.error(`Error al actualizar la categoría de bitácora con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar categoría de bitácora' });
        }
    },  

    // Eliminar una categoría de bitácora
    async delete(req, res) {
        const id = req.params.id; 
    
        try {
            const categoriaBitacora = await CATEGORIA_BITACORAS.findByPk(id);
    
            if (!categoriaBitacora) {
                return res.status(404).json({ error: 'Categoría de bitácora no encontrada' });
            }
    
            await categoriaBitacora.destroy();
            return res.status(200).json({ message: 'Categoría de bitácora eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar categoría de bitácora:', error);
            return res.status(500).json({ error: 'Error al eliminar categoría de bitácora' });
        }
    }
};
