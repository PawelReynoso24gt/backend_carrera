'use strict';
const db = require('../models');
const RecaudacionEvento = db.recaudacion_eventos;
const Eventos = db.eventos;
const Empleados = db.empleados;

module.exports = {
  // Obtener todas las recaudaciones activas
  async find(req, res) {
    try {
      const recaudaciones = await RecaudacionEvento.findAll({
        where: { estado: 1 },
      });
      return res.status(200).json(recaudaciones);
    } catch (error) {
      console.error('Error al recuperar las recaudaciones de eventos:', error);
      return res.status(500).json({
        message: 'Ocurrió un error al recuperar los datos.',
      });
    }
  },

  // Obtener una recaudación por ID
  async findById(req, res) {
    const id = req.params.id;

    try {
      const recaudacion = await RecaudacionEvento.findByPk(id);

      if (!recaudacion) {
        return res.status(404).json({ message: 'Recaudación no encontrada' });
      }

      return res.status(200).json(recaudacion);
    } catch (error) {
      console.error(`Error al buscar la recaudación con ID ${id}:`, error);
      return res.status(500).json({ error: 'Error al buscar la recaudación' });
    }
  },

  // Crear una nueva recaudación
  async createRecaudacionEvento(req, res) {
    const datos = req.body;

    if (!datos.recaudacion || !datos.fechaRegistro || !datos.idEvento || !datos.idEmpleado) {
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    try {
      // Validar que el evento exista
      const eventoExistente = await Eventos.findByPk(datos.idEvento);
      if (!eventoExistente) {
        return res.status(400).json({ error: 'El idEvento ingresado no existe.' });
      }

      // Validar que el empleado exista
      const empleadoExistente = await Empleados.findByPk(datos.idEmpleado);
      if (!empleadoExistente) {
        return res.status(400).json({ error: 'El idEmpleado ingresado no existe.' });
      }

      const nuevaRecaudacion = await RecaudacionEvento.create({
        recaudacion: datos.recaudacion,
        estado: datos.estado !== undefined ? datos.estado : 1,
        fechaRegistro: datos.fechaRegistro,
        idEvento: datos.idEvento,
        idEmpleado: datos.idEmpleado,
      });

      return res.status(201).json(nuevaRecaudacion);
    } catch (error) {
      console.error('Error al crear la recaudación:', error);
      return res.status(500).json({ error: 'Error al crear la recaudación' });
    }
  },

  // Actualizar una recaudación
  async updateRecaudacionEvento(req, res) {
    const id = req.params.id;
    const datos = req.body;

    const camposActualizados = {};

    if (datos.recaudacion !== undefined) camposActualizados.recaudacion = datos.recaudacion;
    if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
    if (datos.fechaRegistro !== undefined) camposActualizados.fechaRegistro = datos.fechaRegistro;
    if (datos.idEvento !== undefined) camposActualizados.idEvento = datos.idEvento;
    if (datos.idEmpleado !== undefined) camposActualizados.idEmpleado = datos.idEmpleado;

    try {
      // Validar que el evento exista
      if (datos.idEvento) {
        const eventoExistente = await Eventos.findByPk(datos.idEvento);
        if (!eventoExistente) {
          return res.status(400).json({ error: 'El idEvento ingresado no existe.' });
        }
      }

      // Validar que el empleado exista
      if (datos.idEmpleado) {
        const empleadoExistente = await Empleados.findByPk(datos.idEmpleado);
        if (!empleadoExistente) {
          return res.status(400).json({ error: 'El idEmpleado ingresado no existe.' });
        }
      }

      const [rowsUpdated] = await RecaudacionEvento.update(camposActualizados, {
        where: { idRecaudacionEvento: id },
      });

      if (rowsUpdated === 0) {
        return res.status(404).json({ message: 'Recaudación no encontrada' });
      }

      return res.status(200).json({ message: 'La recaudación ha sido actualizada' });
    } catch (error) {
      console.error(`Error al actualizar la recaudación con ID ${id}:`, error);
      return res.status(500).json({ error: 'Error al actualizar la recaudación' });
    }
  },

  // Eliminar una recaudación
  async deleteRecaudacionEvento(req, res) {
    const id = req.params.id;

    try {
      const recaudacion = await RecaudacionEvento.findByPk(id);

      if (!recaudacion) {
        return res.status(404).json({ error: 'Recaudación no encontrada' });
      }

      await recaudacion.destroy();
      return res.status(200).json({ message: 'Recaudación eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar la recaudación:', error);
      return res.status(500).json({ error: 'Error al eliminar la recaudación' });
    }
  },
};
