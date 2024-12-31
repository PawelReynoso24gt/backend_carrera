'use strict';

const { zonedTimeToUtc, format } = require('date-fns-tz');
const { parse, isValid } = require('date-fns'); // isValid para validar fechas
const db = require('../models');
const RecaudacionEvento = db.recaudacion_eventos;
const Eventos = db.eventos;
const Empleados = db.empleados;
const Personas = db.personas;

module.exports = {
  // Obtener todas las recaudaciones activas
  async find(req, res) {
    try {
      const recaudaciones = await RecaudacionEvento.findAll({
        where: { estado: 1 },
        include: [
          {
            model: Eventos,
            as: 'evento',
            include: [
              {
                model: db.sedes,
                as: 'sede',
              }
            ]
          },
          {
            model: Empleados,
            as: 'empleado',
            include: [
              {
                model: Personas,
                as: 'persona',
              }
            ]
          }
        ]
      });
      return res.status(200).json(recaudaciones);
    } catch (error) {
      console.error('Error al recuperar las recaudaciones de eventos:', error);
      return res.status(500).json({
        message: 'Ocurrió un error al recuperar los datos.',
      });
    }
  },

  // Obtener una recaudaciones activas
  async findActive(req, res) {
    try {
      const recaudaciones = await RecaudacionEvento.findAll({
        where: { estado: 1 },
        include: [
          {
            model: Eventos,
            as: 'evento',
            include: [
              {
                model: db.sedes,
                as: 'sede',
              }
            ]
          },
          {
            model: Empleados,
            as: 'empleado',
            include: [
              {
                model: Personas,
                as: 'persona',
              }
            ]
          }
        ]
      });
      return res.status(200).json(recaudaciones);
    } catch (error) {
      console.error('Error al recuperar las recaudaciones de eventos:', error);
      return res.status(500).json({
        message: 'Ocurrió un error al recuperar los datos.',
      });
    }
  },

  async findInactive(req, res) {
    try {
      const recaudaciones = await RecaudacionEvento.findAll({
        where: { estado: 0 },
        include: [
          {
            model: Eventos,
            as: 'evento',
            include: [
              {
                model: db.sedes,
                as: 'sede',
                include: [
                  {
                    model: Personas,
                    as: 'persona',
                  }
                ]
              }
            ]
          },
          {
            model: Empleados,
            as: 'empleado',
          }
        ]
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
      const recaudacion = await RecaudacionEvento.findByPk(id, {
        include: [
          {
            model: Eventos,
            as: 'evento',
            include: [
              {
                model: db.sedes,
                as: 'sede',
              }
            ]
          },
          {
            model: Empleados,
            as: 'empleado',
            include: [
              {
                model: Personas,
                as: 'persona',
              }
            ]
          }
        ]
      });

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

    if (!datos.recaudacion || !datos.idEvento || !datos.idEmpleado || !datos.numeroPersonas) {
        return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    try {
        // Verificar si ya existe una recaudación activa para el evento
        const recaudacionExistente = await RecaudacionEvento.findOne({
            where: { idEvento: datos.idEvento, estado: 1 }
        });

        if (recaudacionExistente) {
            return res.status(400).json({
                message: `Ya existe una recaudación activa para el evento con ID ${datos.idEvento}.`
            });
        }

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

        // Asignar fechaRegistro con la fecha actual si no se envía
        const fechaRegistro = datos.fechaRegistro
            ? new Date(datos.fechaRegistro)
            : new Date();

        const nuevaRecaudacion = await RecaudacionEvento.create({
            recaudacion: datos.recaudacion || 0,
            estado: datos.estado !== undefined ? datos.estado : 1,
            fechaRegistro,
            numeroPersonas: datos.numeroPersonas || 0,
            idEvento: datos.idEvento,
            idEmpleado: datos.idEmpleado,
        });

        // Convertir la fecha de respuesta al formato legible en UTC-6
        const recaudacionConFormato = {
            ...nuevaRecaudacion.toJSON(),
            fechaRegistro: format(new Date(nuevaRecaudacion.fechaRegistro), "yyyy-MM-dd HH:mm:ss", {
                timeZone: "America/Guatemala",
            }),
        };

        return res.status(201).json({
            message: "Recaudación creada con éxito.",
            recaudacion: recaudacionConFormato,
        });
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
  
    // Manejar los campos opcionales
    if (datos.recaudacion !== undefined) camposActualizados.recaudacion = datos.recaudacion;
    if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
    if (datos.fechaRegistro !== undefined) {
      // Convertir la fecha al formato deseado
      const fechaRegistro = parse(datos.fechaRegistro, "yyyy-MM-dd", new Date());
      camposActualizados.fechaRegistro = fechaRegistro; // Guardar directamente la fecha parseada
    }
    if (datos.numeroPersonas !== undefined) camposActualizados.numeroPersonas = datos.numeroPersonas;
    if (datos.idEvento !== undefined) camposActualizados.idEvento = datos.idEvento;
    if (datos.idEmpleado !== undefined) camposActualizados.idEmpleado = datos.idEmpleado;
  
    try {
      // Validar que el evento exista si se está actualizando el idEvento
      if (datos.idEvento) {
        const eventoExistente = await Eventos.findByPk(datos.idEvento);
        if (!eventoExistente) {
          return res.status(400).json({ error: "El idEvento ingresado no existe." });
        }
  
        // Verificar si ya existe otra recaudación activa para el mismo evento
        const recaudacionExistente = await RecaudacionEvento.findOne({
          where: {
            idEvento: datos.idEvento,
            estado: 1,
            idRecaudacionEvento: { [db.Sequelize.Op.ne]: id }, // Excluir la recaudación actual
          },
        });
  
        if (recaudacionExistente) {
          return res.status(400).json({
            message: `Ya existe otra recaudación activa para el evento con ID ${datos.idEvento}.`,
          });
        }
      }
  
      // Validar que el empleado exista si se está actualizando el idEmpleado
      if (datos.idEmpleado) {
        const empleadoExistente = await Empleados.findByPk(datos.idEmpleado);
        if (!empleadoExistente) {
          return res.status(400).json({ error: "El idEmpleado ingresado no existe." });
        }
      }
  
      // Realizar la actualización
      const [rowsUpdated] = await RecaudacionEvento.update(camposActualizados, {
        where: { idRecaudacionEvento: id },
      });
  
      if (rowsUpdated === 0) {
        return res.status(404).json({ message: "Recaudación no encontrada" });
      }
  
      // Obtener la recaudación actualizada para incluir en la respuesta
      const recaudacionActualizada = await RecaudacionEvento.findByPk(id);
  
      return res.status(200).json({
        message: "La recaudación ha sido actualizada",
        recaudacion: recaudacionActualizada,
      });
    } catch (error) {
      console.error(`Error al actualizar la recaudación con ID ${id}:`, error);
      return res.status(500).json({ error: "Error al actualizar la recaudación" });
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
