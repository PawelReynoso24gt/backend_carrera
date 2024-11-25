// ! Controlador de eventos
'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const EVENTOS = db.eventos;
const SEDES = db.sedes;

module.exports = {

    // * Listar todos los eventos con el nombre de la sede
    async findAll(req, res) {
        return EVENTOS.findAll({
            include: [{
                model: SEDES,
                as: 'sede', 
                attributes: ['nombreSede'] 
            }]
        })
        .then((eventos) => {
            res.status(200).send(eventos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los eventos.'
            });
        });
    },

    // * Listar todos los eventos activos
    async findActive(req, res) {
        return EVENTOS.findAll({
            where: {
                estado: 1 
            },
            include: [{
                model: SEDES,
                as: 'sede',
                attributes: ['nombreSede']
            }]
        })
        .then((eventos) => {
            res.status(200).send(eventos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los eventos activos.'
            });
        });
    },

    // * Listar todos los eventos inactivos
    async findInactive(req, res) {
        return EVENTOS.findAll({
            where: {
                estado: 0 
            },
            include: [{
                model: SEDES,
                as: 'sede',
                attributes: ['nombreSede']
            }]
        })
        .then((eventos) => {
            res.status(200).send(eventos);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al listar los eventos inactivos.'
            });
        });
    },

    // * Crear un nuevo evento
    async create(req, res) {
        const { nombreEvento, fechaHoraInicio, fechaHoraFin, descripcion, direccion, idSede } = req.body;
    
        // Validaciones de campos obligatorios
        if (!nombreEvento) {
            return res.status(400).json({ message: 'Falta el campo requerido: nombreEvento.' });
        }
        if (!fechaHoraInicio || !fechaHoraFin) {
            return res.status(400).json({ message: 'Faltan los campos requeridos: fechaHoraInicio y/o fechaHoraFin.' });
        }
        if (!direccion) {
            return res.status(400).json({ message: 'Falta el campo requerido: direccion.' });
        }
        if (!idSede) {
            return res.status(400).json({ message: 'Falta el campo requerido: idSede.' });
        }
    
        // Validaciones de formato
        const regexNombreEvento = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/; // Solo letras y espacios
        const regexDescripcion = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,-]+$/; // Letras, números, espacios y signos .,-
        const regexDireccion = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,#/-]+$/; // Incluye signos usados en direcciones
    
        if (!regexNombreEvento.test(nombreEvento)) {
            return res.status(400).json({ message: 'El nombre del evento solo debe contener letras y espacios.' });
        }
    
        if (descripcion && !regexDescripcion.test(descripcion)) {
            return res.status(400).json({ message: 'La descripción solo puede contener letras, números, espacios y los signos .,-' });
        }
    
        if (!regexDireccion.test(direccion)) {
            return res.status(400).json({ message: 'La dirección solo puede contener letras, números, espacios y los signos ., #/-' });
        }
    
        try {
            // Validar si la sede existe
            const sedeExistente = await SEDES.findByPk(idSede);
            if (!sedeExistente) {
                return res.status(404).json({ message: 'La sede no existe.' });
            }
    
            // Creación del nuevo evento
            const nuevoEvento = await EVENTOS.create({
                nombreEvento,
                fechaHoraInicio,
                fechaHoraFin,
                descripcion,
                estado: 1, // Activo por defecto
                direccion,
                idSede
            });
    
            return res.status(201).json(nuevoEvento);
        } catch (error) {
            console.error('Error al crear el evento:', error);
            return res.status(500).json({
                message: error.message || 'Error al crear el evento.'
            });
        }
    },
    

    // * Actualizar un evento (el estado no se cambia aquí)
    async update(req, res) {
        const { idEvento } = req.params;
        const { nombreEvento, fechaHoraInicio, fechaHoraFin, descripcion, direccion, idSede, estado } = req.body;
    
        const camposActualizados = {};
    
        const regexNombreEvento = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/; 
        const regexDescripcion = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,-]+$/; 
        const regexDireccion = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,#/-]+$/; 
    
        if (nombreEvento !== undefined) {
            if (!regexNombreEvento.test(nombreEvento)) {
                return res.status(400).json({ message: 'El nombre del evento solo debe contener letras y espacios.' });
            }
            camposActualizados.nombreEvento = nombreEvento;
        }
    
        if (descripcion !== undefined) {
            if (!regexDescripcion.test(descripcion)) {
                return res.status(400).json({ message: 'La descripción solo puede contener letras, números, espacios y los signos .,-' });
            }
            camposActualizados.descripcion = descripcion;
        }
    
        if (direccion !== undefined) {
            if (!regexDireccion.test(direccion)) {
                return res.status(400).json({ message: 'La dirección solo puede contener letras, números, espacios y los signos ., #/-' });
            }
            camposActualizados.direccion = direccion;
        }
    
        if (fechaHoraInicio !== undefined) camposActualizados.fechaHoraInicio = fechaHoraInicio;
        if (fechaHoraFin !== undefined) camposActualizados.fechaHoraFin = fechaHoraFin;
    
        if (idSede !== undefined) {
            const sedeExistente = await SEDES.findByPk(idSede);
            if (!sedeExistente) {
                return res.status(404).json({ message: 'La sede no existe.' });
            }
            camposActualizados.idSede = idSede;
        }

           
        if (estado !== undefined) {
            camposActualizados.estado = estado;
        }

    
        try {
            // Actualización del evento
            const [rowsUpdated] = await EVENTOS.update(camposActualizados, {
                where: { idEvento }
            });
    
            if (rowsUpdated === 0) {
                return res.status(404).json({ message: 'Evento no encontrado.' });
            }
    
            return res.status(200).json({ message: 'Evento actualizado con éxito.' });
    
        } catch (error) {
            console.error('Error al actualizar el evento:', error);
            return res.status(500).json({
                message: error.message || 'Error al actualizar el evento.'
            });
        }
    },
    


    // * Buscar un evento por nombre
    async findEvento(req, res) {
        const { nombreEvento } = req.params;

        return EVENTOS.findOne({
            where: {
                nombreEvento: {
                    [Sequelize.Op.like]: `%${nombreEvento}%` 
                }
            },
            include: [{
                model: SEDES,
                as: 'sede',
                attributes: ['nombreSede']
            }]
        })
        .then((evento) => {
            if (!evento) {
                return res.status(404).send({ message: 'Evento no encontrado.' });
            }
            res.status(200).send(evento);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar el evento.'
            });
        });
    },

      // * Buscar un evento por ID
      async findById(req, res) {
        const { idEvento } = req.params;

        return EVENTOS.findByPk(idEvento, {
            include: [{
                model: SEDES,
                as: 'sede',
                attributes: ['nombreSede']
            }]
        })
        .then((evento) => {
            if (!evento) {
                return res.status(404).send({ message: 'Evento no encontrado.' });
            }
            res.status(200).send(evento);
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al buscar el evento por ID.'
            });
        });
    },

    // * Eliminar un evento por ID
    async delete(req, res) {
        const { idEvento } = req.params;

        return EVENTOS.destroy({
            where: { idEvento }
        })
        .then((deleted) => {
            if (deleted === 0) {
                return res.status(404).send({ message: 'Evento no encontrado.' });
            }
            res.status(200).send({ message: 'Evento eliminado con éxito.' });
        })
        .catch((error) => {
            res.status(500).send({
                message: error.message || 'Error al eliminar el evento.'
            });
        });
    }
    
};
