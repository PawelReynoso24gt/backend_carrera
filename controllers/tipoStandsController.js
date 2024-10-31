// ! Controlador de tipo_stands
'use strict';
const Sequelize = require('sequelize');
const db = require('../models');
const TipoStands = db.tipo_stands;

module.exports = {
    // * Get tipos de stands activos
    async find(req, res) {
        try {
            const tipoStands = await TipoStands.findAll({
                where: {
                    estado: 1 // Filtrar por estado 1
                }
            });
            return res.status(200).send(tipoStands);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * Get todos los tipos de stands
    async find_all(req, res) {
        try {
            const tipoStands = await TipoStands.findAll();
            return res.status(200).send(tipoStands);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al recuperar los datos.'
            });
        }
    },

    // * Get tipo de stand por ID
    async findById(req, res) {
        const id = req.params.id;

        try {
            const tipoStand = await TipoStands.findByPk(id);
            if (!tipoStand) {
                return res.status(404).send({
                    message: 'Tipo de stand no encontrado.'
                });
            }
            return res.status(200).send(tipoStand);
        } catch (error) {
            return res.status(500).send({
                message: 'Ocurrió un error al intentar recuperar el registro.'
            });
        }
    },

    // * Crear tipo de stand
    async create(req, res) {
        const datos = req.body;
        const datos_ingreso = {
            tipo: datos.tipo,
            estado: 1,  // Estado activo por defecto
            descripcion: datos.descripcion
        };

        try {
            const newTipoStand = await TipoStands.create(datos_ingreso);
            return res.status(201).send(newTipoStand);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al insertar tipo de stand' });
        }
    },

    // * Actualizar tipo de stand
    async update(req, res) {
        const datos = req.body;
        const id = req.params.id;

        const camposActualizados = {};

        if (datos.tipo !== undefined) camposActualizados.tipo = datos.tipo;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
        if (datos.descripcion !== undefined) camposActualizados.descripcion = datos.descripcion;

        try {
            const [rowsUpdated] = await TipoStands.update(camposActualizados, {
                where: { idTipoStands: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).send({ message: 'Tipo de stand no encontrado' });
            }

            return res.status(200).send('El tipo de stand ha sido actualizado');
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error al actualizar tipo de stand' });
        }
    },

    // * Eliminar tipo de stand
    async delete(req, res) {
        const id = req.params.id;

        try {
            const tipoStand = await TipoStands.findByPk(id);
            if (!tipoStand) {
                return res.status(404).json({ error: 'Tipo de stand no encontrado' });
            }

            await tipoStand.destroy();
            return res.json({ message: 'Tipo de stand eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar tipo de stand:', error);
            return res.status(500).json({ error: 'Error al eliminar tipo de stand' });
        }
    }
};