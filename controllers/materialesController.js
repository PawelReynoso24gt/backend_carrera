// ! Controlador de materiales
'use strict';
const db = require('../models');
const { Op } = require('sequelize');
const MATERIALES = db.materiales;
const COMISIONES = db.comisiones;

// Función para validar los datos del material
function validateData(datos) {
  if (datos.material !== undefined) {
    const materialPattern = /^[a-zA-Z0-9À-ÿ\s]+$/;
    if (!materialPattern.test(datos.material)) {
      return { error: 'El campo material solo debe contener letras, números y espacios.' };
    }
  }
  if (datos.cantidad !== undefined) {
    if (isNaN(datos.cantidad) || datos.cantidad < 0) {
      return { error: 'El campo cantidad debe ser un número válido y mayor o igual a 0.' };
    }
  }
  if (datos.estado !== undefined) {
    if (datos.estado !== 0 && datos.estado !== 1) {
      return { error: 'El campo estado debe ser 0 o 1.' };
    }
  }
  if (datos.idComision !== undefined) {
    if (isNaN(datos.idComision) || datos.idComision < 1) {
      return { error: 'El campo idComision debe ser un número válido.' };
    }
  }

  return null;
}

module.exports = {
  // * Obtener materiales activos
  async find(req, res) {
    try {
      const materiales = await MATERIALES.findAll({        
        include: {
          model: COMISIONES,
          attributes: ['idComision', 'comision', 'descripcion', 'estado', 'idEvento']
        }
      });
      return res.status(200).send(materiales);
    } catch (error) {
      console.error('Error al recuperar los materiales:', error);
      return res.status(500).send({ message: 'Ocurrió un error al recuperar los materiales.' });
    }
  },

  // * Obtener material por ID
  async findById(req, res) {
    const id = req.params.id;
    try {
      const material = await MATERIALES.findByPk(id);
      if (!material) {
        return res.status(404).send({ message: 'Material no encontrado.' });
      }
      return res.status(200).send(material);
    } catch (error) {
      return res.status(500).send({ message: 'Ocurrió un error al intentar recuperar el material.' });
    }
  },

// * Buscar materiales por comisión
async findByComision(req, res) {
  const { idComision } = req.params;

  if (!idComision || isNaN(idComision)) {
    return res.status(400).send({ message: 'Se requiere un ID de comisión válido.' });
  }

  try {
    const materiales = await MATERIALES.findAll({
      where: { idComision }, // Filtrar materiales por el idComision
      include: [
        {
          model: COMISIONES,
          attributes: ['idComision', 'comision', 'descripcion', 'estado', 'idEvento']
        }
      ]
    });

    if (!materiales || materiales.length === 0) {
      return res.status(404).send({ message: 'No se encontraron materiales para esta comisión.' });
    }

    return res.status(200).send(materiales);
  } catch (error) {
    console.error('Error al buscar materiales por comisión:', error);
    return res.status(500).send({ message: 'Error al buscar materiales por comisión.' });
  }
},


  // * Crear material
  async create(req, res) {
    const datos = req.body;
    const error = validateData(datos);
    if (error) {
      return res.status(400).json(error);
    }
    try {
      const nuevoMaterial = await MATERIALES.create(datos);
      return res.status(201).send(nuevoMaterial);
    } catch (error) {
      console.error('Error al insertar material:', error);
      return res.status(500).json({ error: 'Error al insertar material' });
    }
  },

  // * Actualizar material
  async update(req, res) {
    const datos = req.body;
    const id = req.params.id;

    const error = validateData(datos);
    if (error) {
      return res.status(400).json(error);
    }

    const camposActualizados = {};

    if (datos.material !== undefined) camposActualizados.material = datos.material;
    if (datos.cantidad !== undefined) camposActualizados.cantidad = datos.cantidad;
    if (datos.descripcion !== undefined) camposActualizados.descripcion = datos.descripcion;
    if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
    if (datos.idComision !== undefined) camposActualizados.idComision = datos.idComision;

    try {
      const [rowsUpdated] = await MATERIALES.update(camposActualizados, {
        where: { idMaterial: id }
      });
      if (rowsUpdated === 0) {
        return res.status(404).send({ message: 'Material no encontrado' });
      }
      return res.status(200).send('El material ha sido actualizado');
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar material' });
    }
  },

  // * Buscar materiales por nombre
  async findByName(req, res) {
    const nombre = req.query.nombre;
    try {
      const materiales = await MATERIALES.findAll({
        where: {
          material: {
            [Op.like]: `%${nombre}%`
          }
        }
      });
      return res.status(200).send(materiales);
    } catch (error) {
      console.error('Error al buscar materiales:', error);
      return res.status(500).send({ message: 'Ocurrió un error al buscar los materiales.' });
    }
  },

  // * Eliminar material
  async delete(req, res) {
    const id = req.params.id;
    try {
      const material = await MATERIALES.findByPk(id);
      if (!material) {
        return res.status(404).json({ error: 'Material no encontrado' });
      }
      await material.destroy();
      return res.json({ message: 'Material eliminado correctamente' });
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar material' });
    }
  }
};