'use strict';
const db = require('../models');
const DetalleTraslados = db.detalle_traslados;
const Traslados = db.traslados;
const Productos = db.productos;

// Métodos CRUD
module.exports = {
  async find(req, res) {
    try {
      const detalles = await DetalleTraslados.findAll({
        where: {
          estado: 1,
        },
      });
      return res.status(200).json(detalles);
    } catch (error) {
      console.error('Error al recuperar los detalles de traslado:', error);
      return res.status(500).json({
        message: 'Ocurrió un error al recuperar los datos.',
      });
    }
  },

  async findById(req, res) { 
    const id = req.params.id;

    try {
      const detalle = await DetalleTraslados.findByPk(id);

      if (!detalle) {
        return res.status(404).json({ message: 'Detalle no encontrado' });
      }

      return res.status(200).json(detalle);
    } catch (error) {
      console.error(`Error al buscar el detalle con ID ${id}:`, error);
      return res.status(500).json({ error: 'Error al buscar el detalle' });
    }
  },

  async createDetalleTraslado(req, res) {
    const datos = req.body;

    if (!datos.cantidad || !datos.idTraslado || !datos.idProducto) {
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    try {
      const trasladoExistente = await Traslados.findOne({
        where: { idTraslado: datos.idTraslado, estado: 1 }
      });
      if (!trasladoExistente) {
        return res.status(400).json({ error: 'El idTraslado ingresado no existe o no está disponible.' });
      }

      const productoExistente = await Productos.findOne({
        where: { idProducto: datos.idProducto, estado: 1 }
      });
      if (!productoExistente) {
        return res.status(400).json({ error: 'El idProducto ingresado no existe o no está disponible.' });
      }

      const nuevoDetalle = await DetalleTraslados.create({
        cantidad: datos.cantidad,
        estado: datos.estado !== undefined ? datos.estado : 1,
        idTraslado: datos.idTraslado,
        idProducto: datos.idProducto,
      });

      return res.status(201).json(nuevoDetalle);
    } catch (error) {
      console.error('Error al crear el detalle de traslado:', error);
      return res.status(500).json({ error: 'Error al crear el detalle' });
    }
  },

  async updateDetalleTraslado(req, res) {
    const datos = req.body;
    const id = req.params.id;

    const camposActualizados = {};

    if (datos.cantidad !== undefined) camposActualizados.cantidad = datos.cantidad;
    camposActualizados.estado = datos.estado !== undefined ? datos.estado : 1; 

    try {
      if (datos.idTraslado !== undefined) {
        const trasladoExistente = await Traslados.findOne({
          where: { idTraslado: datos.idTraslado, estado: 1 }
        });
        if (!trasladoExistente) {
          return res.status(400).json({ error: 'El idTraslado ingresado no existe o no está disponible.' });
        }
        camposActualizados.idTraslado = datos.idTraslado;
      }

      if (datos.idProducto !== undefined) {
        const productoExistente = await Productos.findOne({
          where: { idProducto: datos.idProducto, estado: 1 }
        });
        if (!productoExistente) {
          return res.status(400).json({ error: 'El idProducto ingresado no existe o no está disponible.' });
        }
        camposActualizados.idProducto = datos.idProducto;
      }

      const [rowsUpdated] = await DetalleTraslados.update(camposActualizados, {
        where: { idDetalleTraslado: id },
      });

      if (rowsUpdated === 0) {
        return res.status(404).json({ message: 'Detalle no encontrado' });
      }

      return res.status(200).json({ message: 'El detalle ha sido actualizado' });
    } catch (error) {
      console.error(`Error al actualizar el detalle con ID ${id}:`, error);
      return res.status(500).json({ error: 'Error al actualizar detalle' });
    }
  },

  async deleteDetalleTraslado(req, res) {
    const id = req.params.id;

    try {
      const detalle = await DetalleTraslados.findByPk(id);

      if (!detalle) {
        return res.status(404).json({ error: 'Detalle no encontrado' });
      }

      await detalle.destroy();
      return res.status(200).json({ message: 'Detalle eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar detalle:', error);
      return res.status(500).json({ error: 'Error al eliminar detalle' });
    }
  },
};
