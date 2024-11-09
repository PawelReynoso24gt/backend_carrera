// ! Controlador de sedes
'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const SEDES = db.sedes;

module.exports = {

     // * Listar todas las sedes
    async findAll(req, res) {
        return SEDES.findAll({
        })
        .then((sedes) => {
            res.status(200).send(sedes);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las sedes.'
            });
        });
    },

    // * Listar todas las sedes activas
    async findActive(req, res) {
        return SEDES.findAll({
            where: {
                estado: 1 
            }
        })
        .then((sedes) => {
            res.status(200).send(sedes);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las sedes.'
            });
        });
    },

    // * Listar todas las sedes inactivas
    async findInactive(req, res) {
        return SEDES.findAll({
            where: {
                estado: 0 
            }
        })
        .then((sedes) => {
            res.status(200).send(sedes);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar las sedes.'
            });
        });
    },

    
    // * Crear una nueva sede 
    async create(req, res) {
        const { informacion, nombreSede } = req.body;
    

        if (!informacion) {
            return res.status(400).json({ message: 'Falta el campo requerido: informacion.' });
        }
        if (!nombreSede) {
            return res.status(400).json({ message: 'Falta el campo requerido: nombreSede.' });
        }
    

        const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
        if (!regexNombre.test(nombreSede)) {
            return res.status(400).json({ message: 'El nombre de la sede solo debe contener letras y espacios.' });
        }
    
        try {

            const nuevaSede = await SEDES.create({
                informacion,
                nombreSede,
                estado: 1 
            });
            return res.status(201).json(nuevaSede);
        } catch (error) {
            console.error('Error al crear la sede:', error);
            return res.status(500).json({
                message: error.message || 'Error al crear la sede.'
            });
        }
    },
    

    // * Actualizar los campos de una sede (el estado no se cambia aqui)
    async update(req, res) {
        const { idSede } = req.params;
        const { informacion, nombreSede } = req.body;
    
        const camposActualizados = {};
    
        if (informacion !== undefined) {
            camposActualizados.informacion = informacion;
        }
        
        if (nombreSede !== undefined) {
            const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
            if (!regexNombre.test(nombreSede)) {
                return res.status(400).json({ message: 'El nombre de la sede solo debe contener letras y espacios.' });
            }
            camposActualizados.nombreSede = nombreSede;
        }
    
        try {

            const [rowsUpdated] = await SEDES.update(camposActualizados, {
                where: { idSede }
            });
    
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Sede no encontrada.' });
            }
    
            return res.status(200).json({ message: 'Sede actualizada con éxito.' });
    
        } catch (error) {
            console.error('Error al actualizar la sede:', error);
            return res.status(500).json({
                message: error.message || 'Error al actualizar la sede.'
            });
        }
    },
    

    // * Buscar una sede por nombre
    async findSede(req, res) {
        const { nombreSede } = req.params;

        return SEDES.findOne({
            where: {
                nombreSede: {
                    [Sequelize.Op.like]: `%${nombreSede}%` 
                }
            }
        })
        .then((sede) => {
            if (!sede) {
                return res.status(404).send({ message: 'Sede no encontrada.' });
            }
            res.status(200).send(sede);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar la sede.'
            });
        });
    },

     // * Buscar una sede por ID
     async findById(req, res) {
        const { idSede } = req.params;

        return SEDES.findByPk(idSede)
        .then((sede) => {
            if (!sede) {
                return res.status(404).send({ message: 'Sede no encontrada.' });
            }
            res.status(200).send(sede);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar la sede por ID.'
            });
        });
    },

    // * Eliminar una sede por ID
    async delete(req, res) {
        const { idSede } = req.params;

        return SEDES.destroy({
            where: { idSede }
        })
        .then((deleted) => {
            if (deleted === 0) {
                return res.status(404).send({ message: 'Sede no encontrada.' });
            }
            res.status(200).send({ message: 'Sede eliminada con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al eliminar la sede.'
            });
        });
    }

};
