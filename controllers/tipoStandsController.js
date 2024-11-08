// ! Controlador de tipo_stands
'use strict';
const Sequelize = require('sequelize');
const db = require('../models');
const TipoStands = db.tipo_stands;

// Función para validar los datos de entrada para create y update
function validateTipoStandData(data) {
    const tipoRegex = /^[A-Za-zÀ-ÿ\s]+$/; // Solo letras y espacios
    const descripcionRegex = /^[A-ZÀ-ÿa-z0-9.,()"\s]+$/; // Letras, números, comas, puntos, paréntesis, comillas y espacios

    if (!data.tipo || !tipoRegex.test(data.tipo)) {
        return 'El campo tipo solo debe contener letras y espacios';
    }
    if (data.estado !== undefined && data.estado !== 0 && data.estado !== 1) {
        return 'El campo estado debe ser 0 o 1';
    }
    if (data.descripcion && !descripcionRegex.test(data.descripcion)) {
        return 'El campo descripcion solo debe contener letras, numeros, comas, puntos, parentesis, comillas y espacios';
    }

    return null;
}

module.exports = {
    // * Get tipos de stands activos
    async find(req, res) {
        try {
            const tipoStands = await TipoStands.findAll({
                where: {
                    estado: 1 
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
    async findAll(req, res) {
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

        // Validar los datos antes de insertarlos
        const error = validateTipoStandData(datos);
        if (error) {
            return res.status(400).json({ error });
        }

        const datos_ingreso = {
            tipo: datos.tipo,
            estado: 1,
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

        // Validar los datos antes de actualizarlos
        const error = validateTipoStandData(datos);
        if (error) {
            return res.status(400).json({ error });
        }

        const camposActualizados = {};

        if (datos.tipo !== undefined) camposActualizados.tipo = datos.tipo;
        if (datos.estado !== undefined) camposActualizados.estado = datos.estado;
        if (datos.descripcion !== undefined) camposActualizados.descripcion = datos.descripcion;

        try {
            const [rowsUpdated] = await TipoStands.update(camposActualizados, {
                where: { idTipoStands: id }
            });

            if (rowsUpdated === 0) {
                return res.status(404).json({ error: 'Tipo de stand no encontrado' });
            }

            return res.status(200).json({ message: 'El tipo de stand ha sido actualizado' });
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