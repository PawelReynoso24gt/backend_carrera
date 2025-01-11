'use strict';
const db = require('../models');
const DetallePedido = db.detalle_pedidos;
const Pedidos = db.pedidos;
const Productos = db.productos;
const { parseISO, startOfDay, format } = require('date-fns');

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

  async createPedidoConDetalle(req, res) {
    const { fecha, descripcion, idSede, idUsuario, detalles } = req.body;

    if (!fecha || !descripcion || !idSede || !idUsuario || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ message: 'Faltan campos requeridos o los detalles están vacíos.' });
    }

    const fechaInicioDia = format(startOfDay(parseISO(fecha)), "yyyy-MM-dd'T'HH:mm:ss");

    const transaction = await db.sequelize.transaction();

    try {
        // Crear el pedido
        const pedido = await Pedidos.create(
            { fecha: fechaInicioDia, descripcion, estado: 1, idSede, idUsuario },
            { transaction }
        );

        // Validar y procesar los detalles del pedido
        for (const detalle of detalles) {
            const { idProducto, cantidad } = detalle;

            if (!idProducto || !cantidad) {
                throw new Error('Cada detalle debe contener idProducto y cantidad.');
            }

            // Verificar si el producto existe
            const producto = await Productos.findByPk(idProducto, { transaction });
            if (!producto) {
                throw new Error(`Producto con ID ${idProducto} no encontrado.`);
            }

            // Crear el detalle del pedido
            await DetallePedido.create(
                {
                    idPedido: pedido.idPedido,
                    idProducto,
                    cantidad,
                    estado: 1
                },
                { transaction }
            );
        }

        // Confirmar la transacción
        await transaction.commit();

        return res.status(201).json({ message: 'Pedido creado con éxito.', pedido });
    } catch (error) {
        // Revertir la transacción en caso de error
        await transaction.rollback();
        console.error('Error al crear pedido con detalle:', error);
        return res.status(500).json({ message: error.message || 'Error al crear pedido con detalle.' });
    }
},

async updatePedidoConDetalle(req, res) {
  const idPedido = req.params.id; // ID del pedido a actualizar
  const { fecha, descripcion, idSede, idUsuario, detalles } = req.body;

  if (!fecha || !descripcion || !idSede || !idUsuario || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ message: 'Faltan campos requeridos o los detalles están vacíos.' });
  }

  const fechaInicioDia = format(startOfDay(parseISO(fecha)), "yyyy-MM-dd'T'HH:mm:ss");

  const transaction = await db.sequelize.transaction();

  try {
      // Verificar si el pedido existe
      const pedidoExistente = await Pedidos.findByPk(idPedido, { transaction });
      if (!pedidoExistente) {
          return res.status(404).json({ message: 'El pedido no existe.' });
      }

      // Actualizar el pedido
      await Pedidos.update(
          { fecha: fechaInicioDia, descripcion, idSede, idUsuario },
          { where: { idPedido }, transaction }
      );

      // Obtener los detalles existentes del pedido
      const detallesExistentes = await DetallePedido.findAll({
          where: { idPedido },
          transaction
      });

      // Crear un mapa de detalles existentes para fácil comparación
      const detallesExistentesMap = new Map(
          detallesExistentes.map(det => [det.idProducto, det])
      );

      // Procesar los nuevos detalles
      for (const detalle of detalles) {
          const { idProducto, cantidad } = detalle;

          if (!idProducto || !cantidad) {
              throw new Error('Cada detalle debe contener idProducto y cantidad.');
          }

          if (detallesExistentesMap.has(idProducto)) {
              // Si el detalle ya existe, actualizar la cantidad si es diferente
              const detalleExistente = detallesExistentesMap.get(idProducto);
              if (detalleExistente.cantidad !== cantidad) {
                  await DetallePedido.update(
                      { cantidad },
                      { where: { idDetallePedido: detalleExistente.idDetallePedido }, transaction }
                  );
              }
              // Eliminar del mapa para que al final solo queden los detalles que se deben eliminar
              detallesExistentesMap.delete(idProducto);
          } else {
              // Si el detalle no existe, crear uno nuevo
              await DetallePedido.create(
                  { idPedido, idProducto, cantidad, estado: 1 },
                  { transaction }
              );
          }
      }

      // Eliminar los detalles que no están en los nuevos detalles
      for (const detalleExistente of detallesExistentesMap.values()) {
          await DetallePedido.destroy({
              where: { idDetallePedido: detalleExistente.idDetallePedido },
              transaction
          });
      }

      // Confirmar la transacción
      await transaction.commit();

      return res.status(200).json({ message: 'Pedido actualizado con éxito.' });
  } catch (error) {
      // Revertir la transacción en caso de error
      await transaction.rollback();
      console.error('Error al actualizar pedido con detalle:', error);
      return res.status(500).json({ message: error.message || 'Error al actualizar pedido con detalle.' });
  }
},

async getPedidoConDetalle(req, res) {
  const idPedido = req.params.id; 

  try {
      // Buscar el pedido con sus detalles
      const pedido = await Pedidos.findByPk(idPedido, {
          include: [
              {
                  model: DetallePedido,
                  include: [
                      {
                          model: Productos,
                          attributes: ['idProducto', 'nombreProducto', 'descripcion', 'precio']
                      }
                  ],
                  attributes: ['idDetallePedido', 'cantidad', 'estado']
              }
          ],
          attributes: ['idPedido', 'fecha', 'descripcion', 'estado', 'idSede', 'idUsuario']
      });

      if (!pedido) {
          return res.status(404).json({ message: 'Pedido no encontrado.' });
      }

      return res.status(200).json({ pedido });
  } catch (error) {
      console.error('Error al obtener pedido con detalle:', error);
      return res.status(500).json({ message: 'Error al obtener pedido con detalle.' });
  }
}

};
