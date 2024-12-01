'use strict';
const db = require('../models');
const DetallePedido = db.detalle_pedidos;
const Pedidos = db.pedidos;
const Productos = db.productos;

module.exports = {
  // Obtener todos los detalles de pedidos activos
  async find(req, res) {
    try {
      const detalles = await DetallePedido.findAll({
        where: { estado: 1 },
      });
      return res.status(200).json(detalles);
    } catch (error) {
      console.error('Error al recuperar los detalles de pedido:', error);
      return res.status(500).json({
        message: 'Ocurrió un error al recuperar los datos.',
      });
    }
  },

  // Obtener un detalle de pedido por ID
  async findById(req, res) {
    const id = req.params.id;

    try {
      const detalle = await DetallePedido.findByPk(id);

      if (!detalle) {
        return res.status(404).json({ message: 'Detalle de pedido no encontrado' });
      }

      return res.status(200).json(detalle);
    } catch (error) {
      console.error(`Error al buscar el detalle con ID ${id}:`, error);
      return res.status(500).json({ error: 'Error al buscar el detalle' });
    }
  },

  // Crear un nuevo detalle de pedido
  async createDetallePedido(req, res) {
    const datos = req.body;

    if (!datos.cantidad || !datos.idPedido || !datos.idProducto) {
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    try {
 
      const pedidoExistente = await Pedidos.findByPk(datos.idPedido);
      if (!pedidoExistente) {
        return res.status(400).json({ error: 'El idPedido ingresado no existe.' });
      }

 
      const productoExistente = await Productos.findByPk(datos.idProducto);
      if (!productoExistente) {
        return res.status(400).json({ error: 'El idProducto ingresado no existe.' });
      }

      const nuevoDetalle = await DetallePedido.create({
        cantidad: datos.cantidad,
        estado: datos.estado !== undefined ? datos.estado : 1,
        idPedido: datos.idPedido,
        idProducto: datos.idProducto,
      });

      return res.status(201).json(nuevoDetalle);
    } catch (error) {
      console.error('Error al crear el detalle de pedido:', error);
      return res.status(500).json({ error: 'Error al crear el detalle de pedido' });
    }
  },

  // Actualizar un detalle de pedido
  async updateDetallePedido(req, res) {
    const id = req.params.id;
    const datos = req.body;

    const camposActualizados = {};

    if (datos.cantidad !== undefined) camposActualizados.cantidad = datos.cantidad;
    if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
    if (datos.idPedido !== undefined) camposActualizados.idPedido = datos.idPedido;
    if (datos.idProducto !== undefined) camposActualizados.idProducto = datos.idProducto;

    try {

      if (datos.idPedido) {
        const pedidoExistente = await Pedidos.findByPk(datos.idPedido);
        if (!pedidoExistente) {
          return res.status(400).json({ error: 'El idPedido ingresado no existe.' });
        }
      }


      if (datos.idProducto) {
        const productoExistente = await Productos.findByPk(datos.idProducto);
        if (!productoExistente) {
          return res.status(400).json({ error: 'El idProducto ingresado no existe.' });
        }
      }

      const [rowsUpdated] = await DetallePedido.update(camposActualizados, {
        where: { idDetallePedido: id },
      });

      if (rowsUpdated === 0) {
        return res.status(404).json({ message: 'Detalle de pedido no encontrado' });
      }

      return res.status(200).json({ message: 'El detalle de pedido ha sido actualizado' });
    } catch (error) {
      console.error(`Error al actualizar el detalle de pedido con ID ${id}:`, error);
      return res.status(500).json({ error: 'Error al actualizar el detalle de pedido' });
    }
  },

  // Eliminar un detalle de pedido
  async deleteDetallePedido(req, res) {
    const id = req.params.id;

    try {
      const detalle = await DetallePedido.findByPk(id);

      if (!detalle) {
        return res.status(404).json({ error: 'Detalle de pedido no encontrado' });
      }

      await detalle.destroy();
      return res.status(200).json({ message: 'Detalle de pedido eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar el detalle de pedido:', error);
      return res.status(500).json({ error: 'Error al eliminar el detalle de pedido' });
    }
  },
};
