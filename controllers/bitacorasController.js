'use strict';
const db = require('../models');
const Bitacora = db.bitacoras;
const Usuarios = db.usuarios;
const Personas = db.personas;
const CategoriasBitacora = db.categoria_bitacoras;

module.exports = {
  // Obtener todas las bitácoras activas
  async find(req, res) {
    try {
      const bitacoras = await Bitacora.findAll({
        where: { estado: 1 },
        include: [
          {
            model: Usuarios,
            as: 'usuario',
            attributes: ['idUsuario'],
            include: [
              {
                model: Personas,
                as: 'persona',
                attributes: ['idPersona', 'nombre'],
              },
            ],
          },
          {
            model: CategoriasBitacora,
            as: 'categoria_bitacora',
            attributes: ['idCategoriaBitacora', 'categoria'],
          },
        ],
      });
      return res.status(200).json(bitacoras);
    } catch (error) {
      console.error('Error al recuperar las bitácoras:', error);
      return res.status(500).json({
        message: 'Ocurrió un error al recuperar los datos.',
      });
    }
  },

  // Obtener una bitácora por ID
  async findById(req, res) {
    const id = req.params.id;

    try {
      const bitacora = await Bitacora.findByPk(id);

      if (!bitacora) {
        return res.status(404).json({ message: 'Bitácora no encontrada' });
      }

      return res.status(200).json(bitacora);
    } catch (error) {
      console.error(`Error al buscar la bitácora con ID ${id}:`, error);
      return res.status(500).json({ error: 'Error al buscar la bitácora' });
    }
  },

  // Crear una nueva bitácora
  async createBitacora(req, res) {
    const datos = req.body;

    // Asegurar que estado tenga un valor por defecto de 1
    const estado = datos.estado !== undefined ? datos.estado : 1;

    if (!datos.descripcion || !datos.idCategoriaBitacora) {
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    try {
      // Validar que el usuario exista solo si idUsuario no es null
      if (datos.idUsuario !== null) {
        const usuarioExistente = await Usuarios.findByPk(datos.idUsuario);
        if (!usuarioExistente) {
          return res.status(400).json({ error: 'El idUsuario ingresado no existe.' });
        }
      }

      // Validar que la categoría exista
      const categoriaExistente = await CategoriasBitacora.findByPk(datos.idCategoriaBitacora);
      if (!categoriaExistente) {
        return res.status(400).json({ error: 'El idCategoriaBitacora ingresado no existe.' });
      }

      const nuevaBitacora = await Bitacora.create({
        fechaHora: new Date(), // Establecer la fecha y hora actual
        descripcion: datos.descripcion,
        estado: estado,
        idUsuario: datos.idUsuario || null,
        idCategoriaBitacora: datos.idCategoriaBitacora,
      });

      return res.status(201).json(nuevaBitacora);
    } catch (error) {
      console.error('Error al crear la bitácora:', error);
      return res.status(500).json({ error: 'Error al crear la bitácora' });
    }
  },

  // Actualizar una bitácora
  async updateBitacora(req, res) {
    const id = req.params.id;
    const datos = req.body;

    const camposActualizados = {};

    if (datos.fechaHora !== undefined) camposActualizados.fechaHora = datos.fechaHora;
    if (datos.descripcion !== undefined) camposActualizados.descripcion = datos.descripcion;
    if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
    if (datos.idUsuario !== undefined) camposActualizados.idUsuario = datos.idUsuario;
    if (datos.idCategoriaBitacora !== undefined) camposActualizados.idCategoriaBitacora = datos.idCategoriaBitacora;

    try {
      // Validar que el usuario exista
      if (datos.idUsuario) {
        const usuarioExistente = await Usuarios.findByPk(datos.idUsuario);
        if (!usuarioExistente) {
          return res.status(400).json({ error: 'El idUsuario ingresado no existe.' });
        }
      }

      // Validar que la categoría exista
      if (datos.idCategoriaBitacora) {
        const categoriaExistente = await CategoriasBitacora.findByPk(datos.idCategoriaBitacora);
        if (!categoriaExistente) {
          return res.status(400).json({ error: 'El idCategoriaBitacora ingresado no existe.' });
        }
      }

      const [rowsUpdated] = await Bitacora.update(camposActualizados, {
        where: { idBitacora: id },
      });

      if (rowsUpdated === 0) {
        return res.status(404).json({ message: 'Bitácora no encontrada' });
      }

      return res.status(200).json({ message: 'La bitácora ha sido actualizada' });
    } catch (error) {
      console.error(`Error al actualizar la bitácora con ID ${id}:`, error);
      return res.status(500).json({ error: 'Error al actualizar la bitácora' });
    }
  },

  // Eliminar una bitácora
  async deleteBitacora(req, res) {
    const id = req.params.id;

    try {
      const bitacora = await Bitacora.findByPk(id);

      if (!bitacora) {
        return res.status(404).json({ error: 'Bitácora no encontrada' });
      }

      await bitacora.destroy();
      return res.status(200).json({ message: 'Bitácora eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar la bitácora:', error);
      return res.status(500).json({ error: 'Error al eliminar la bitácora' });
    }
  },
};
