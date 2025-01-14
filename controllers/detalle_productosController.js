'use strict';
const db = require('../models');
const DetalleProductos = db.detalle_productos;
const Sedes = db.sedes;
const Productos = db.productos;

module.exports = {
  // Obtener todos los detalles de productos activos
  async find(req, res) {
    try {
      const detalles = await DetalleProductos.findAll({
        where: { estado: 1 },
        include: [
          {
            model: Productos, 
            as: 'producto', 
            attributes: ['nombreProducto'], 
          },
          {
            model: Sedes, 
            as: 'sede', 
            attributes: ['nombreSede'], 
          },
        ],
      });
      return res.status(200).json(detalles);
    } catch (error) {
      console.error('Error al recuperar los detalles de productos:', error);
      return res.status(500).json({
        message: 'Ocurrió un error al recuperar los datos.',
      });
    }
  },
  
  // Obtener un detalle de producto por ID
  async findById(req, res) {
    const id = req.params.id;
  
    try {
      const detalle = await DetalleProductos.findByPk(id, {
        include: [
          {
            model: Productos, // Relación con Productos
            as: 'producto', // Alias definido en el modelo
            attributes: ['idProducto', 'nombreProducto', 'precio'], // Campos específicos de Productos
          },
          {
            model: Sedes, // Relación con Sedes
            as: 'sede', // Alias definido en el modelo
            attributes: ['idSede', 'nombreSede'], // Campos específicos de Sedes
          },
        ],
      });
  
      if (!detalle) {
        return res.status(404).json({ message: 'Detalle de producto no encontrado' });
      }
  
      return res.status(200).json(detalle);
    } catch (error) {
      console.error(`Error al buscar el detalle con ID ${id}:`, error);
      return res.status(500).json({ error: 'Error al buscar el detalle' });
    }
  },
  
  // * detalles con estado 1
  async findActive(req, res) {
    try {
      const detallesActivos = await DetalleProductos.findAll({
        where: { estado: 1 },
        include: [
          {
            model: Productos, // Relación con Productos
            as: 'producto', // Alias definido en el modelo
            attributes: ['idProducto', 'nombreProducto', 'precio'], // Campos específicos de Productos
          },
          {
            model: Sedes, // Relación con Sedes
            as: 'sede', // Alias definido en el modelo
            attributes: ['idSede', 'nombreSede'], // Campos específicos de Sedes
          },
        ],
      });
  
      return res.status(200).send(detallesActivos);
    } catch (error) {
      console.error('Error al recuperar los detalles de productos activos:', error);
      return res
        .status(500)
        .send({ message: 'Ocurrió un error al recuperar los detalles de productos activos.' });
    }
  },
  
  async findInactive(req, res) {
    try {
      const detallesInactivos = await DetalleProductos.findAll({
        where: { estado: 0 },
        include: [
          {
            model: Productos, // Relación con Productos
            as: 'producto', // Alias definido en el modelo
            attributes: ['idProducto', 'nombreProducto', 'precio'], // Campos específicos de Productos
          },
          {
            model: Sedes, // Relación con Sedes
            as: 'sede', // Alias definido en el modelo
            attributes: ['idSede', 'nombreSede'], // Campos específicos de Sedes
          },
        ],
      });
  
      return res.status(200).send(detallesInactivos);
    } catch (error) {
      console.error('Error al recuperar los detalles de productos inactivos:', error);
      return res
        .status(500)
        .send({ message: 'Ocurrió un error al recuperar los detalles de productos inactivos.' });
    }
  },
  
  

  // Crear un nuevo detalle de producto
  async createDetalleProducto(req, res) {
    const datos = req.body;

    if (!datos.cantidad || !datos.idSede || !datos.idProducto) {
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    try {
      // Validar que la sede exista
      const sedeExistente = await Sedes.findByPk(datos.idSede);
      if (!sedeExistente) {
        return res.status(400).json({ error: 'El idSede ingresado no existe.' });
      }

      // Validar que el producto exista
      const productoExistente = await Productos.findByPk(datos.idProducto);
      if (!productoExistente) {
        return res.status(400).json({ error: 'El idProducto ingresado no existe.' });
      }

      const nuevoDetalle = await DetalleProductos.create({
        cantidad: datos.cantidad,
        estado: datos.estado !== undefined ? datos.estado : 1,
        idSede: datos.idSede,
        idProducto: datos.idProducto,
      });

      return res.status(201).json(nuevoDetalle);
    } catch (error) {
      console.error('Error al crear el detalle de producto:', error);
      return res.status(500).json({ error: 'Error al crear el detalle de producto' });
    }
  },

  // Actualizar un detalle de producto
  async updateDetalleProducto(req, res) {
    const id = req.params.id;
    const datos = req.body;

    const camposActualizados = {};

    if (datos.cantidad !== undefined) camposActualizados.cantidad = datos.cantidad;
    if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
    if (datos.idSede !== undefined) camposActualizados.idSede = datos.idSede;
    if (datos.idProducto !== undefined) camposActualizados.idProducto = datos.idProducto;

    try {
      // Validar que la sede exista
      if (datos.idSede) {
        const sedeExistente = await Sedes.findByPk(datos.idSede);
        if (!sedeExistente) {
          return res.status(400).json({ error: 'El idSede ingresado no existe.' });
        }
      }

      // Validar que el producto exista
      if (datos.idProducto) {
        const productoExistente = await Productos.findByPk(datos.idProducto);
        if (!productoExistente) {
          return res.status(400).json({ error: 'El idProducto ingresado no existe.' });
        }
      }

      const [rowsUpdated] = await DetalleProductos.update(camposActualizados, {
        where: { idDetalleProductos: id },
      });

      if (rowsUpdated === 0) {
        return res.status(404).json({ message: 'Detalle de producto no encontrado' });
      }

      return res.status(200).json({ message: 'El detalle de producto ha sido actualizado' });
    } catch (error) {
      console.error(`Error al actualizar el detalle de producto con ID ${id}:`, error);
      return res.status(500).json({ error: 'Error al actualizar el detalle de producto' });
    }
  },

  // Eliminar un detalle de producto
  async deleteDetalleProducto(req, res) {
    const id = req.params.id;

    try {
      const detalle = await DetalleProductos.findByPk(id);

      if (!detalle) {
        return res.status(404).json({ error: 'Detalle de producto no encontrado' });
      }

      await detalle.destroy();
      return res.status(200).json({ message: 'Detalle de producto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar el detalle de producto:', error);
      return res.status(500).json({ error: 'Error al eliminar el detalle de producto' });
    }
  },
};
