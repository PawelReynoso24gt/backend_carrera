'use strict';
const { where } = require("sequelize");
const db = require("../models");
const PRODUCTOS = db.productos;
const CATEGORIAS = db.categorias;
const path = require('path');
const fs = require('fs');

// Métodos CRUD
module.exports = {

    // Obtener todos los productos
    async find(req, res) {
        try {
            const productos = await PRODUCTOS.findAll({
                include: [
                    {
                        model: CATEGORIAS,
                        attributes: ["idCategoria", "nombreCategoria"],
                    },
                    {
                        model: db.detalle_stands,
                        as: "detallesStands",
                        attributes: ["idDetalleStands", "cantidad", "estado", "idStand"],
                        include: {
                            model: db.stands,
                            as: "stand",
                            attributes: ["idStand", "nombreStand"],
                        },
                    },
                    {
                        model: db.detalle_productos,
                        attributes: ["idDetalleProductos", "cantidad", "estado", "idSede"],
                        include: {
                            model: db.sedes,
                            attributes: ["idSede", "nombreSede"],
                        },
                    },
                ],
                where: {
                    estado: 1,
                },
            });
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
            const producto = await PRODUCTOS.findByPk(id, {
                include: [
                    {
                        model: CATEGORIAS,
                        attributes: ["idCategoria", "nombreCategoria"],
                    },
                    {
                        model: db.detalle_stands,
                        as: "detallesStands",
                        attributes: ["idDetalleStands", "cantidad", "estado", "idStand"],
                        include: {
                            model: db.stands,
                            as: "stand",
                            attributes: ["idStand", "nombreStand"],
                        },
                    },
                    {
                        model: db.detalle_productos,
                        attributes: ["idDetalleProductos", "cantidad", "estado", "idSede"],
                        include: {
                            model: db.sedes,
                            attributes: ["idSede", "nombreSede"],
                        },
                    },
                ],
            });

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

        // Verificar campos requeridos
        if (!datos.talla || !datos.precio || !datos.nombreProducto || !datos.descripcion || !datos.cantidadMinima || !datos.cantidadMaxima || !datos.idCategoria) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        // Validar talla
        const regexTalla = /^(?:\d+|S|M|L|XL|XXL|XXXL|NA)$/; // Permitir números o S, M, L, XL, XXL, XXXL o que No Aplica (NA)
        if (!regexTalla.test(datos.talla)) {
            return res.status(400).json({ message: 'La talla debe ser un número o una de las siguientes letras: S, M, L, XL, XXL, XXXL, NA.' });
        }

        // Validar precio
        if (isNaN(datos.precio)|| datos.precio < 0) {
            return res.status(400).json({ message: 'El precio debe ser un número positivo.' });
        }

        // Validar nombre del producto
        const regexNombreProducto = /^.+$/; // expresión regular para todo menos salto de línea
        if (!regexNombreProducto.test(datos.nombreProducto)) {
            return res.status(400).json({ message: 'El nombre del producto contiene caracteres no válidos.' });
        }

        // Validar cantidad mínima
        if (isNaN(datos.cantidadMinima) || datos.cantidadMinima < 0) {
            return res.status(400).json({ message: 'La cantidad mínima debe ser un número no negativo.' });
        }

        // Validar cantidad máxima
        if (isNaN(datos.cantidadMaxima) || datos.cantidadMaxima < 0) {
            return res.status(400).json({ message: 'La cantidad máxima debe ser un número no negativo.' });
        }

        // Verificar existencia de la categoría
        const categoria = await CATEGORIAS.findByPk(datos.idCategoria);
        if (!categoria) {
            return res.status(400).json({ message: 'La categoría especificada no existe.' });
        }


        let fotoRuta = 'productos_image/sin-foto.png'; // Valor predeterminado
        if (req.file) {
            fotoRuta = `productos_image/${req.file.filename}`; // Guardar la ruta relativa
        }


        // Crear el nuevo producto
        const nuevoProducto = { 
            talla: datos.talla,
            precio: datos.precio,
            nombreProducto: datos.nombreProducto,
            descripcion: datos.descripcion,
            cantidadMinima: datos.cantidadMinima,
            cantidadMaxima: datos.cantidadMaxima,
            idCategoria: datos.idCategoria,
            foto: fotoRuta,
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
        const datos = {
            ...req.body,
            precio: parseFloat(req.body.precio),
            cantidadMinima: parseInt(req.body.cantidadMinima, 10),
            cantidadMaxima: parseInt(req.body.cantidadMaxima, 10),
            idCategoria: parseInt(req.body.idCategoria, 10),
            estado: parseInt(req.body.estado, 10),
        };
        const id = req.params.id;

        const camposActualizados = {};
    
        if (datos.talla !== undefined) {
            // Expresión regular para validar tallas
            const regexTalla = /^(?:\d+|S|M|L|XL|XXL|XXXL|NA)$/; // Permitir números o S, M, L, XL, XXL, XXXL, NA 
            if (!regexTalla.test(datos.talla)) {
                return res.status(400).json({ message: 'La talla debe ser un número o una de las siguientes letras: S, M, L, XL, XXL, XXXL, NA.' });
            }
            camposActualizados.talla = datos.talla;
        }
        if (datos.precio !== undefined) camposActualizados.precio = datos.precio;
        if (datos.nombreProducto !== undefined) {
            // Validación de nombreProducto
            const regexTexto = /^.+$/;
            if (!regexTexto.test(datos.nombreProducto)) {
                return res.status(400).json({ message: 'El nombre del producto contiene caracteres no válidos.' });
            }
            camposActualizados.nombreProducto = datos.nombreProducto;
        }
        if (datos.descripcion !== undefined) camposActualizados.descripcion = datos.descripcion;
        if (datos.cantidadMinima !== undefined) {
            // Validar que cantidadMinima sea un número no negativo
            if (typeof datos.cantidadMinima !== 'number' || datos.cantidadMinima < 0) {
                return res.status(400).json({ message: 'La cantidad mínima debe ser un número no negativo.' });
            }
            camposActualizados.cantidadMinima = datos.cantidadMinima;
        }
    
        if (datos.cantidadMaxima !== undefined) {
            // Validar que cantidadMaxima sea un número no negativo
            if (typeof datos.cantidadMaxima !== 'number' || datos.cantidadMaxima < 0) {
                return res.status(400).json({ message: 'La cantidad máxima debe ser un número no negativo.' });
            }
            camposActualizados.cantidadMaxima = datos.cantidadMaxima;
        }
    
        if (datos.idCategoria !== undefined) {
            const idCategoria = parseInt(datos.idCategoria, 10);
            if (isNaN(idCategoria)) {
                return res.status(400).json({ message: 'El ID de categoría es inválido.' });
            }

            const categoria = await CATEGORIAS.findByPk(idCategoria);
            if (!categoria) {
                return res.status(400).json({ message: 'La categoría especificada no existe.' });
            }
            camposActualizados.idCategoria = idCategoria;
        }
    
        if (datos.estado !== undefined) {
            // Validar que estado sea un número (por ejemplo, 0 o 1)
            if (![0, 1].includes(datos.estado)) {
                return res.status(400).json({ message: 'El estado debe ser 0 (inactivo) o 1 (activo).' });
            }
            camposActualizados.estado = datos.estado;
        }

         // Manejar actualización de la foto
        let nuevaFotoRuta;
        if (req.file) {
            nuevaFotoRuta = `productos_image/${req.file.filename}`;

            // Buscar el producto actual para eliminar la foto anterior si existe
            const productoActual = await PRODUCTOS.findByPk(id);
            if (productoActual && productoActual.foto && productoActual.foto !== 'productos_image/sin-foto.png') {
                const fotoPath = path.join(__dirname, '../src', productoActual.foto);
                if (fs.existsSync(fotoPath)) {
                    fs.unlinkSync(fotoPath); // Eliminar la foto anterior
                }
            }

            // Actualizar la ruta de la foto
            camposActualizados.foto = nuevaFotoRuta;
        }
            
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

    // Actualizar el estado de un producto existente
    async updateEstado(req, res) {
        const { estado } = req.body;
        const id = req.params.id;

        // Validar que estado sea un número (por ejemplo, 0 o 1)
        if (![0, 1].includes(parseInt(estado, 10))) {
            return res.status(400).json({ message: 'El estado debe ser 0 (inactivo) o 1 (activo).' });
        }

        try {
            const [rowsUpdated] = await PRODUCTOS.update(
                { estado: parseInt(estado, 10) },
                {
                    where: { idProducto: id }
                }
            );

            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }

            return res.status(200).json({ message: 'El estado del producto ha sido actualizado' });
        } catch (error) {
            console.error(`Error al actualizar el estado del producto con ID ${id}:`, error);
            return res.status(500).json({ error: 'Error al actualizar el estado del producto' });
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
    },

    // Obtener todos los productos estado 1
    async findActive(req, res) {
        try {
            const productos = await PRODUCTOS.findAll({
                include: [
                    {
                        model: CATEGORIAS,
                        attributes: ["idCategoria", "nombreCategoria"],
                    },
                    {
                        model: db.detalle_stands,
                        as: 'detallesStands',
                        attributes: ["idDetalleStands", "cantidad", "estado", "idStand"],
                        include: {
                            model: db.stands,
                            as: "stand",
                            attributes: ["idStand", "nombreStand"],
                        },
                    },
                    {
                        model: db.detalle_productos,
                        attributes: ["idDetalleProductos", "cantidad", "estado", "idSede"],
                        include: {
                            model: db.sedes,
                            attributes: ["idSede", "nombreSede"],
                        },
                    },
                ],
                where: {
                    estado: 1,
                },
            });
            return res.status(200).json(productos);
        } catch (error) {
            console.error('Error al recuperar los productos:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // Obtener todos los productos estado 0
    async findInactive(req, res) {
        try {
            const productos = await PRODUCTOS.findAll({
                include: [
                    {
                        model: CATEGORIAS,
                        attributes: ["idCategoria", "nombreCategoria"],
                    },
                    {
                        model: db.detalle_stands,
                        as: 'detallesStands',
                        attributes: ["idDetalleStands", "cantidad", "estado", "idStand"],
                        include: {
                            model: db.stands,
                            as: "stand",
                            attributes: ["idStand", "nombreStand"],
                        },
                    },
                    {
                        model: db.detalle_productos,
                        attributes: ["idDetalleProductos", "cantidad", "estado", "idSede"],
                        include: {
                            model: db.sedes,
                            attributes: ["idSede", "nombreSede"],
                        },
                    },
                ],
                where: {
                    estado: 0,
                },
            });
            return res.status(200).json(productos);
        } catch (error) {
            console.error('Error al recuperar los productos:', error);
            return res.status(500).json({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },
};
