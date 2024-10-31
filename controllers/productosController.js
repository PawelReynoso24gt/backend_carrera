'use strict';
const db = require("../models");
const PRODUCTOS = db.productos;

// Métodos CRUD
module.exports = {

    // Obtener todos los productos
    async find(req, res) {
        try {
            const productos = await PRODUCTOS.findAll();
            return res.status(200).json(productos);
        } catch (error) {
            console.error('Error al recuperar los productos:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // Obtener un producto por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const producto = await PRODUCTOS.findByPk(id);

            if (!producto) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }

            return res.status(200).json(producto);
        } catch (error) {
            console.error(`Error al buscar producto con ID ${id}:`, error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar el producto.'
            });
        }
    },

    // Crear un nuevo producto
    async create(req, res) {
        const datos = req.body;

        if (!datos.talla || !datos.precio || !datos.nombreProducto || !datos.descripcion || !datos.cantidadMinima || !datos.cantidadMaxima || !datos.idCategoria) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        const nuevoProducto = { 
            talla: datos.talla,
            precio: datos.precio,
            nombreProducto: datos.nombreProducto,
            descripcion: datos.descripcion,
            cantidadMinima: datos.cantidadMinima,
            cantidadMaxima: datos.cantidadMaxima,
            idCategoria: datos.idCategoria,
            estado: datos.estado !== undefined ? datos.estado : 1
        };

        try {
            const producto = await PRODUCTOS.create(nuevoProducto);
            return res.status(201).json(producto);
        } catch (error) {
            console.error('Error al insertar el producto:', error);
            return res.status(500).json({ error: 'Error al insertar el producto' });
        }
    },

    // Actualizar un producto existente
    async update(req, res) {
        const datos = req.body;
        const id = req.params.id;

        const camposActualizados = {};
    
        if (datos.talla !== undefined) camposActualizados.talla = datos.talla;
        if (datos.precio !== undefined) camposActualizados.precio = datos.precio;
        if (datos.nombreProducto !== undefined) camposActualizados.nombreProducto = datos.nombreProducto;
        if (datos.descripcion !== undefined) camposActualizados.descripcion = datos.descripcion;
        if (datos.cantidadMinima !== undefined) camposActualizados.cantidadMinima = datos.cantidadMinima;
        if (datos.cantidadMaxima !== undefined) camposActualizados.cantidadMaxima = datos.cantidadMaxima;
        if (datos.idCategoria !== undefined) camposActualizados.idCategoria = datos.idCategoria;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;

        try {
            const [rowsUpdated] = await PRODUCTOS.update(
                camposActualizados,
                {
                    where: { idProducto: id } 
                }
            );
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            return res.status(200).json({ message: 'El producto ha sido actualizado' });
        } catch (error) {
            console.error(`Error al actualizar el producto con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar el producto' });
        }
    },  

    // Eliminar un producto
    async delete(req, res) {
        const id = req.params.id; 
    
        try {
            const producto = await PRODUCTOS.findByPk(id);
    
            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
    
            await producto.destroy();
            return res.status(200).json({ message: 'Producto eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            return res.status(500).json({ error: 'Error al eliminar producto' });
        }
    }
};
