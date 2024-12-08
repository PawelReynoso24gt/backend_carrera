'use strict';
const db = require('../models');
const Bitacora = db.bitacoras;
const Usuarios = db.usuarios;
const CategoriasBitacora = db.categoria_bitacoras;

module.exports = {
  // Obtener todas las bitácoras activas
  async find(req, res) {
    try {
      const bitacoras = await Bitacora.findAll({
        where: { estado: 'activo' },
      });
      return res.status(200).json(bitacoras);
    } catch (error) {
      console.error('Error al recuperar las bitácoras:', error);
      return res.status(500).json({
        message: 'Ocurrió un error al recuperar los datos.',
      });
    }
  },

  // Obtener los problemas detectados con información del usuario
  async findProblemaDetectado(req, res) {
    try {
      const bitacoras = await Bitacora.findAll({
        where: { estado: 'problema detectado' },
        include: [
          {
            model: db.usuarios, // El modelo relacionado
            as: 'usuario', // Alias definido en la asociación del modelo de bitácoras
            attributes: ['idUsuario', 'usuario'], // Campos específicos que quieres traer
            include: [
              {
                model: db.personas, // Incluir el modelo relacionado con usuarios (opcional)
                as: 'persona', // Alias definido en el modelo
                attributes: ['idPersona', 'nombre'], // Campos que quieras de personas
              },
            ],
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

  // Obtener los problemas en revisión
  async findProblemaRevision(req, res) {
    try {
      const bitacoras = await Bitacora.findAll({
        where: { estado: 'problema en revisión' },
        include: [
          {
            model: db.usuarios, // El modelo relacionado
            as: 'usuario', // Alias definido en la asociación del modelo de bitácoras
            attributes: ['idUsuario', 'usuario'], // Campos específicos que quieres traer
            include: [
              {
                model: db.personas, // Incluir el modelo relacionado con usuarios (opcional)
                as: 'persona', // Alias definido en el modelo
                attributes: ['idPersona', 'nombre'], // Campos que quieras de personas
              },
            ],
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

  // Obtener los problemas solucionados
  async findProblemaSolucionado(req, res) {
    try {
      const bitacoras = await Bitacora.findAll({
        where: { estado: 'problema solucionado' },
        include: [
          {
            model: db.usuarios, // El modelo relacionado
            as: 'usuario', // Alias definido en la asociación del modelo de bitácoras
            attributes: ['idUsuario', 'usuario'], // Campos específicos que quieres traer
            include: [
              {
                model: db.personas, // Incluir el modelo relacionado con usuarios (opcional)
                as: 'persona', // Alias definido en el modelo
                attributes: ['idPersona', 'nombre'], // Campos que quieras de personas
              },
            ],
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

    if (!datos.fechaHora || !datos.descripcion || !datos.estado || !datos.idUsuario || !datos.idCategoriaBitacora) {
      return res.status(400).json({ message: 'Faltan campos requeridos.' });
    }

    try {
      // Validar que el usuario exista
      const usuarioExistente = await Usuarios.findByPk(datos.idUsuario);
      if (!usuarioExistente) {
        return res.status(400).json({ error: 'El idUsuario ingresado no existe.' });
      }

      // Validar que la categoría exista
      const categoriaExistente = await CategoriasBitacora.findByPk(datos.idCategoriaBitacora);
      if (!categoriaExistente) {
        return res.status(400).json({ error: 'El idCategoriaBitacora ingresado no existe.' });
      }

      const nuevaBitacora = await Bitacora.create({
        fechaHora: datos.fechaHora,
        descripcion: datos.descripcion,
        estado: datos.estado,
        idUsuario: datos.idUsuario,
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
