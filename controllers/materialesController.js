// ! Controlador de materiales
'use strict';
const db = require('../models');
const MATERIALES = db.materiales;

module.exports = {
  // * Obtener materiales activos
  async find(req, res) {
    try {
      const materiales = await MATERIALES.findAll({
        where: { estado: 1 }
      });
      return res.status(200).send(materiales);
    } catch (error) {
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

  // * Crear material
  async create(req, res) {
    const datos = req.body;
    try {
      const nuevoMaterial = await MATERIALES.create(datos);
      return res.status(201).send(nuevoMaterial);
    } catch (error) {
      return res.status(500).json({ error: 'Error al insertar material' });
    }
  },

  // * Actualizar material
  async update(req, res) {
    const datos = req.body;
    const id = req.params.id;
    try {
      const [rowsUpdated] = await MATERIALES.update(datos, {
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